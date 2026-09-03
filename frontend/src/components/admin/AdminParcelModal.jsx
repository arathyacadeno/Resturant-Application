import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Printer,
  Search,
  Package,
  Clock,
  User,
  Phone,
  CheckCircle2,
  ChefHat,
  Receipt,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ordersApi } from '../../api/ordersApi';
import { menuApi } from '../../api/menuApi';
import { AdminBillModal } from './AdminBillModal';

export const AdminParcelModal = ({ isOpen, onClose, onOrderCreated }) => {
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'new', 'history'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Menu items for creating new parcel orders
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // New Parcel Order Cart
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [packagingNotes, setPackagingNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [selectedPortions, setSelectedPortions] = useState({});

  // Bill Modal state
  const [billOrder, setBillOrder] = useState(null);

  // Load orders & menu
  const loadParcelOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await ordersApi.getOrders({ order_type: 'takeaway' });
      const list = res.results || res;
      if (Array.isArray(list)) {
        setOrders(list);
      }
    } catch (err) {
      console.error('Failed to load parcel orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadMenuData = async () => {
    setLoadingMenu(true);
    try {
      const [catsRes, itemsRes] = await Promise.allSettled([
        menuApi.getCategories(),
        menuApi.getMenuItems(),
      ]);
      if (catsRes.status === 'fulfilled') {
        const rawCats = catsRes.value?.results || catsRes.value || [];
        setCategories(Array.isArray(rawCats) ? rawCats : []);
      }
      if (itemsRes.status === 'fulfilled') {
        const rawItems = itemsRes.value?.results || itemsRes.value || [];
        setMenuItems(Array.isArray(rawItems) ? rawItems : []);
      }
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadParcelOrders();
      loadMenuData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Active vs History parcel orders
  const activeOrders = orders.filter(
    (o) => o.status !== 'billed' && o.status !== 'cancelled'
  );
  const historyOrders = orders.filter(
    (o) => o.status === 'billed' || o.status === 'cancelled'
  );

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' ||
      String(item.category) === String(selectedCategory) ||
      String(item.category_name || '').toLowerCase() === String(selectedCategory).toLowerCase();

    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  // Portion price helper
  const getItemPrice = (item, portion = 'Full') => {
    const basePrice = parseFloat(item.price || 0);
    if (portion === 'Half' && item.half_price) {
      return parseFloat(item.half_price);
    }
    if (portion === 'Quarter' && item.quarter_price) {
      return parseFloat(item.quarter_price);
    }
    return basePrice;
  };

  // Cart operations
  const handleAddToCart = (item) => {
    const portion = selectedPortions[item.id] || 'Full';
    const price = getItemPrice(item, portion);
    const key = `${item.id}-${portion}`;

    setCart((prev) => {
      const idx = prev.findIndex((c) => c.key === key);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [
        ...prev,
        {
          key,
          item,
          portion,
          unit_price: price,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (key, delta) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.key === key) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveFromCart = (key) => {
    setCart((prev) => prev.filter((c) => c.key !== key));
  };

  const cartSubtotal = cart.reduce(
    (sum, c) => sum + c.unit_price * c.quantity,
    0
  );

  // Status transition handler
  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await ordersApi.updateOrderStatus(orderId, nextStatus);
      await loadParcelOrders();
      if (onOrderCreated) onOrderCreated();
    } catch (err) {
      console.error('Failed to update parcel order status:', err);
      alert(err.response?.data?.error || 'Failed to update order status');
    }
  };

  // Create new parcel order
  const handleCreateOrder = async (andPrintBill = false) => {
    if (cart.length === 0) {
      alert('Please select at least one menu item.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        table: null,
        order_type: 'takeaway',
        customer_name: customerName.trim() || 'Parcel Customer',
        customer_phone: customerPhone.trim(),
        kitchen_notes: packagingNotes.trim() ? `[PARCEL] ${packagingNotes.trim()}` : '[PARCEL]',
        notes: packagingNotes.trim(),
        items: cart.map((c) => ({
          menu_item: c.item.id,
          quantity: c.quantity,
          unit_price: c.unit_price,
          portion: c.portion,
        })),
      };

      const created = await ordersApi.createOrder(payload);

      // Reset cart and form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setPackagingNotes('');

      await loadParcelOrders();
      if (onOrderCreated) onOrderCreated();

      if (andPrintBill && created) {
        setBillOrder(created);
      } else {
        setActiveTab('active');
      }
    } catch (err) {
      console.error('Failed to create parcel order:', err);
      alert(err.response?.data?.error || err.response?.data?.detail || 'Failed to create parcel order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <>
      <div className="admin-parcel-modal-overlay" onClick={onClose}>
        <div
          className="admin-parcel-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ═══════════════════════════════════════════════════════════════
              MODAL HEADER
          ═══════════════════════════════════════════════════════════════ */}
          <div className="admin-parcel-modal-header">
            <div className="admin-parcel-modal-header-left">
              <div className="admin-parcel-header-icon-box">
                <Package size={22} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="admin-parcel-modal-title">Parcel Orders (Takeaway)</h2>
                <p className="admin-parcel-modal-subtitle">
                  Create new parcel orders, track preparation status, and print receipts.
                </p>
              </div>
            </div>

            <div className="admin-parcel-modal-header-actions">
              <button
                type="button"
                className="admin-parcel-refresh-btn"
                onClick={loadParcelOrders}
                title="Refresh Orders"
              >
                <RefreshCw size={16} className={loadingOrders ? 'spin-icon' : ''} />
              </button>
              <button
                type="button"
                className="admin-parcel-close-btn"
                onClick={onClose}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TAB NAVIGATION
          ═══════════════════════════════════════════════════════════════ */}
          <div className="admin-parcel-tabs-row">
            <button
              type="button"
              className={`admin-parcel-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <Package size={16} />
              <span>Active Parcels</span>
              <span className="admin-parcel-tab-badge">{activeOrders.length}</span>
            </button>

            <button
              type="button"
              className={`admin-parcel-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              <Plus size={16} />
              <span>+ New Parcel Order</span>
            </button>

            <button
              type="button"
              className={`admin-parcel-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <Clock size={16} />
              <span>History / Billed</span>
              <span className="admin-parcel-tab-badge secondary">{historyOrders.length}</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: ACTIVE PARCELS LIST
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'active' && (
            <div className="admin-parcel-tab-body">
              {loadingOrders ? (
                <div className="admin-parcel-empty-state">
                  <RefreshCw size={28} className="spin-icon" color="#9C5147" />
                  <p>Loading active parcel orders...</p>
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="admin-parcel-empty-state">
                  <div className="admin-parcel-empty-icon-wrap">
                    <Package size={36} color="#9C5147" />
                  </div>
                  <h3>No Active Parcel Orders</h3>
                  <p>There are no parcel or takeaway orders currently in progress.</p>
                  <button
                    type="button"
                    className="admin-parcel-primary-btn"
                    onClick={() => setActiveTab('new')}
                  >
                    <Plus size={16} />
                    <span>Create New Parcel Order</span>
                  </button>
                </div>
              ) : (
                <div className="admin-parcel-cards-grid">
                  {activeOrders.map((ord) => {
                    const status = ord.status || 'pending';
                    const itemsCount = ord.items?.length || 0;
                    const amount = ord.total_amount || ord.subtotal || 0;
                    const timeStr = new Date(ord.created_at || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div key={ord.id} className={`admin-parcel-card status-${status}`}>
                        {/* Card Header */}
                        <div className="admin-parcel-card-header">
                          <div>
                            <div className="admin-parcel-card-order-id">
                              <span>Parcel #{ord.id}</span>
                              <span className={`admin-parcel-status-tag ${status}`}>
                                {status.toUpperCase()}
                              </span>
                            </div>
                            <div className="admin-parcel-customer-info">
                              <User size={13} />
                              <span>{ord.customer_name || 'Takeaway Guest'}</span>
                              {ord.customer_phone && (
                                <>
                                  <span className="dot-sep">•</span>
                                  <Phone size={12} />
                                  <span>{ord.customer_phone}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="admin-parcel-card-time">
                            <Clock size={13} />
                            <span>{timeStr}</span>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="admin-parcel-card-items">
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} className="admin-parcel-item-row">
                              <span className="admin-parcel-item-qty">{item.quantity}x</span>
                              <span className="admin-parcel-item-name">
                                {item.menu_item_name || 'Item'}{' '}
                                {item.portion && item.portion !== 'Full' && (
                                  <span className="portion-tag">({item.portion})</span>
                                )}
                              </span>
                              <span className="admin-parcel-item-price">
                                ₹{item.subtotal || parseFloat(item.unit_price || 0) * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Special Packaging / Kitchen Notes */}
                        {(ord.kitchen_notes || ord.notes) && (
                          <div className="admin-parcel-notes-box">
                            📝 {ord.kitchen_notes || ord.notes}
                          </div>
                        )}

                        {/* Card Footer: Amount & Workflow Actions */}
                        <div className="admin-parcel-card-footer">
                          <div className="admin-parcel-amount-wrap">
                            <span className="label">Total Amount:</span>
                            <span className="value">₹{amount}</span>
                          </div>

                          <div className="admin-parcel-card-actions">
                            {status === 'pending' && (
                              <button
                                type="button"
                                className="admin-parcel-btn-action preparing"
                                onClick={() => handleUpdateStatus(ord.id, 'preparing')}
                              >
                                <ChefHat size={14} />
                                <span>Start Preparing</span>
                              </button>
                            )}

                            {status === 'preparing' && (
                              <button
                                type="button"
                                className="admin-parcel-btn-action ready"
                                onClick={() => handleUpdateStatus(ord.id, 'ready')}
                              >
                                <CheckCircle2 size={14} />
                                <span>Ready to Pickup</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="admin-parcel-btn-action print"
                              onClick={() => setBillOrder(ord)}
                              title="Print Bill / Settle"
                            >
                              <Printer size={14} />
                              <span>Bill & Settle</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: CREATE NEW PARCEL ORDER
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'new' && (
            <div className="admin-parcel-new-order-layout">
              {/* Left Column: Menu Selector */}
              <div className="admin-parcel-menu-pane">
                {/* Search & Categories */}
                <div className="admin-parcel-menu-controls">
                  <div className="admin-parcel-search-input-wrap">
                    <Search size={16} color="#8C827A" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <X size={14} color="#8C827A" />
                      </button>
                    )}
                  </div>

                  <div className="admin-parcel-cat-pills">
                    {['All', ...categories.map((c) => c.name || c)].map((catName) => (
                      <button
                        key={catName}
                        type="button"
                        className={`admin-parcel-cat-pill ${selectedCategory === catName ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(catName)}
                      >
                        {catName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items Grid */}
                <div className="admin-parcel-items-grid">
                  {loadingMenu ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#8C827A' }}>
                      Loading menu catalogue...
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#8C827A' }}>
                      No items found.
                    </div>
                  ) : (
                    filteredMenuItems.map((item) => {
                      const portion = selectedPortions[item.id] || 'Full';
                      const currentPrice = getItemPrice(item, portion);
                      const hasHalf = Boolean(item.half_price);
                      const hasQuarter = Boolean(item.quarter_price);

                      return (
                        <div key={item.id} className="admin-parcel-menu-card">
                          <div className="admin-parcel-menu-card-top">
                            <div className="admin-parcel-menu-card-details">
                              <span className={`veg-dot ${item.is_veg ? 'veg' : 'non-veg'}`} />
                              <h4 className="admin-parcel-item-title">{item.name}</h4>
                              <span className="admin-parcel-item-price-tag">₹{currentPrice}</span>
                            </div>
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="admin-parcel-item-thumb"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                          </div>

                          {/* Portion selection */}
                          {(hasHalf || hasQuarter) && (
                            <div className="admin-parcel-portions-row">
                              <button
                                type="button"
                                className={`admin-parcel-portion-chip ${portion === 'Full' ? 'active' : ''}`}
                                onClick={() =>
                                  setSelectedPortions((prev) => ({ ...prev, [item.id]: 'Full' }))
                                }
                              >
                                Full (₹{item.price})
                              </button>
                              {hasHalf && (
                                <button
                                  type="button"
                                  className={`admin-parcel-portion-chip ${portion === 'Half' ? 'active' : ''}`}
                                  onClick={() =>
                                    setSelectedPortions((prev) => ({ ...prev, [item.id]: 'Half' }))
                                  }
                                >
                                  Half (₹{item.half_price})
                                </button>
                              )}
                              {hasQuarter && (
                                <button
                                  type="button"
                                  className={`admin-parcel-portion-chip ${portion === 'Quarter' ? 'active' : ''}`}
                                  onClick={() =>
                                    setSelectedPortions((prev) => ({ ...prev, [item.id]: 'Quarter' }))
                                  }
                                >
                                  Qtr (₹{item.quarter_price})
                                </button>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            className="admin-parcel-add-btn"
                            onClick={() => handleAddToCart(item)}
                          >
                            <Plus size={14} strokeWidth={2.5} />
                            <span>Add to Parcel</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Order Cart & Details */}
              <div className="admin-parcel-cart-pane">
                <h3 className="admin-parcel-cart-heading">Parcel Order Details</h3>

                {/* Customer Details Inputs */}
                <div className="admin-parcel-form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    placeholder="Guest / Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="admin-parcel-form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="Contact number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>

                <div className="admin-parcel-form-group">
                  <label>Packaging / Special Kitchen Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, pack sauces separately"
                    value={packagingNotes}
                    onChange={(e) => setPackagingNotes(e.target.value)}
                  />
                </div>

                {/* Cart Items List */}
                <div className="admin-parcel-cart-items-box">
                  <div className="admin-parcel-cart-items-header">
                    <span>Selected Items ({cart.length})</span>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        className="admin-parcel-cart-clear-btn"
                        onClick={() => setCart([])}
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="admin-parcel-cart-empty">
                      <p>No items added yet. Click "+ Add to Parcel" on any menu item.</p>
                    </div>
                  ) : (
                    <div className="admin-parcel-cart-list">
                      {cart.map((c) => (
                        <div key={c.key} className="admin-parcel-cart-row">
                          <div className="admin-parcel-cart-row-info">
                            <span className="title">{c.item.name}</span>
                            <span className="sub">
                              ₹{c.unit_price}{' '}
                              {c.portion && c.portion !== 'Full' ? `(${c.portion})` : ''}
                            </span>
                          </div>

                          <div className="admin-parcel-cart-counter">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(c.key, -1)}
                            >
                              <Minus size={12} />
                            </button>
                            <span>{c.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(c.key, 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="admin-parcel-cart-item-total">
                            ₹{c.unit_price * c.quantity}
                          </div>

                          <button
                            type="button"
                            className="admin-parcel-cart-del-btn"
                            onClick={() => handleRemoveFromCart(c.key)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Summary & Submit Buttons */}
                <div className="admin-parcel-cart-summary">
                  <div className="admin-parcel-summary-line total">
                    <span>Grand Total:</span>
                    <span>₹{cartSubtotal}</span>
                  </div>

                  <div className="admin-parcel-cart-btn-stack">
                    <button
                      type="button"
                      className="admin-parcel-submit-btn primary"
                      disabled={cart.length === 0 || submittingOrder}
                      onClick={() => handleCreateOrder(false)}
                    >
                      {submittingOrder ? (
                        <span>Placing Parcel Order...</span>
                      ) : (
                        <>
                          <ChefHat size={16} />
                          <span>Place Parcel Order</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="admin-parcel-submit-btn secondary"
                      disabled={cart.length === 0 || submittingOrder}
                      onClick={() => handleCreateOrder(true)}
                    >
                      <Printer size={16} />
                      <span>Place & Print Bill</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: HISTORY / BILLED PARCEL ORDERS
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'history' && (
            <div className="admin-parcel-tab-body">
              {historyOrders.length === 0 ? (
                <div className="admin-parcel-empty-state">
                  <Clock size={36} color="#9C5147" />
                  <h3>No Past Parcel Orders</h3>
                  <p>Billed and settled parcel orders will appear here.</p>
                </div>
              ) : (
                <div className="admin-parcel-history-table-wrap">
                  <table className="admin-parcel-history-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date & Time</th>
                        <th style={{ textAlign: 'center' }}>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyOrders.map((ord) => (
                        <tr key={ord.id}>
                          <td style={{ fontWeight: 700 }}>#{ord.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ord.customer_name || 'Parcel Guest'}</div>
                            {ord.customer_phone && (
                              <div style={{ fontSize: '0.75rem', color: '#8C827A' }}>
                                {ord.customer_phone}
                              </div>
                            )}
                          </td>
                          <td>
                            <div>{ord.items?.length || 0} items</div>
                            {(ord.kitchen_notes || ord.notes) && (
                              <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '2px' }}>
                                {ord.kitchen_notes || ord.notes}
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 800 }}>₹{ord.total_amount || ord.subtotal || 0}</td>
                          <td>
                            <span className={`admin-parcel-status-tag ${ord.status}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td style={{ color: '#8C827A', fontSize: '0.8rem' }}>
                            {new Date(ord.created_at || Date.now()).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="admin-parcel-history-print-btn"
                              onClick={() => setBillOrder(ord)}
                            >
                              <Printer size={13} />
                              <span>View Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bill & Settlement Modal Integration */}
      <AdminBillModal
        isOpen={Boolean(billOrder)}
        table={{ id: billOrder?.table, number: billOrder?.table_number }}
        activeOrder={billOrder}
        onClose={() => setBillOrder(null)}
        onBillSettled={() => {
          setBillOrder(null);
          loadParcelOrders();
          if (onOrderCreated) onOrderCreated();
        }}
      />
    </>
  );
};

export default AdminParcelModal;
