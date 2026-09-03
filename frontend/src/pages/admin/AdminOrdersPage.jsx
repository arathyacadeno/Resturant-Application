import React, { useState, useEffect } from 'react';
import { ordersApi } from '../../api/ordersApi';
import { Search, Printer, Package, Plus } from 'lucide-react';
import { AdminBillModal } from '../../components/admin/AdminBillModal';
import { AdminParcelModal } from '../../components/admin/AdminParcelModal';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBillOrder, setSelectedBillOrder] = useState(null);
  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getOrders();
      const list = res.results || res;
      if (Array.isArray(list)) {
        setOrders(list);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const isTakeaway = o.order_type === 'takeaway' || (!o.table && !o.table_number);
    let matchesStatus = true;
    if (filterStatus === 'parcel') {
      matchesStatus = isTakeaway;
    } else if (filterStatus === 'dine_in') {
      matchesStatus = !isTakeaway;
    } else if (filterStatus !== 'all') {
      matchesStatus = o.status === filterStatus;
    }

    const matchesSearch =
      !search ||
      String(o.id).includes(search) ||
      String(o.table_number || '').includes(search) ||
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (isTakeaway && 'parcel takeaway'.includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* ── Top Header Row ── */}
      <div className="admin-top-header">
        <div className="admin-top-greeting">
          <h1>Orders & Billing</h1>
          <p>Real-time live feed of floor orders, billing statuses, and print receipts.</p>
        </div>

        <div className="admin-top-actions">
          {/* Search Bar */}
          <div className="admin-search-pill">
            <input
              type="text"
              placeholder="Search orders, tables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button" className="admin-search-icon-btn" title="Search">
              <Search size={18} color="#FFFFFF" strokeWidth={2.5} />
            </button>
          </div>

          {/* Parcel Orders Button */}
          <button
            type="button"
            className="admin-menu-btn-parcel-orders"
            onClick={() => setIsParcelModalOpen(true)}
            style={{
              height: '42px',
              padding: '0 20px',
              borderRadius: '9999px',
              backgroundColor: '#200604',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: '13.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(32, 6, 4, 0.2)'
            }}
          >
            <Package size={16} />
            <span>Parcel Orders</span>
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="admin-filter-pill-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'parcel', label: '📦 Parcel Orders' },
          { key: 'dine_in', label: '🍽️ Dine-In' },
          { key: 'pending', label: 'Pending' },
          { key: 'preparing', label: 'Preparing' },
          { key: 'ready', label: 'Ready' },
          { key: 'billed', label: 'Billed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((st) => (
          <button
            key={st.key}
            type="button"
            className={`admin-filter-pill-btn ${filterStatus === st.key ? 'active' : ''}`}
            onClick={() => setFilterStatus(st.key)}
            style={{
              padding: '6px 18px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: filterStatus === st.key ? '#2A160F' : '#FFFFFF',
              color: filterStatus === st.key ? '#FFFFFF' : '#6B5E55',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* ── Orders Table Card ── */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #EAE1D8', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#756B66' }}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#756B66' }}>No orders found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EAE1D8', color: '#756B66', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type / Table</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const isTakeaway = ord.order_type === 'takeaway' || (!ord.table_number && !ord.table);
                  return (
                    <tr key={ord.id} style={{ borderBottom: '1px solid #F4EAE0', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>#{ord.id}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        {isTakeaway ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#9C5147', backgroundColor: '#FDF4F3', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Package size={12} />
                            <span>Parcel</span>
                          </span>
                        ) : (
                          <span>Table {ord.table_number || ord.table}</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#6B5E55' }}>
                        <div>{ord.items?.length || 0} items</div>
                        {(ord.kitchen_notes || ord.notes) && (
                          <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '2px', fontWeight: 600 }}>
                            📝 {ord.kitchen_notes || ord.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>₹{ord.total_amount || 0}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor:
                              ord.status === 'billed'
                                ? '#DCFCE7'
                                : ord.status === 'preparing'
                                ? '#FEF3C7'
                                : ord.status === 'ready'
                                ? '#DBEAFE'
                                : '#FEE2E2',
                            color:
                              ord.status === 'billed'
                                ? '#16A34A'
                                : ord.status === 'preparing'
                                ? '#D97706'
                                : ord.status === 'ready'
                                ? '#2563EB'
                                : '#DC2626',
                          }}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#8C827A', fontSize: '0.8rem' }}>
                        {new Date(ord.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedBillOrder(ord)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #171717',
                            backgroundColor: '#FFFFFF',
                            color: '#171717',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title="Print / View Bill"
                        >
                          <Printer size={13} color="#B87F00" strokeWidth={2.2} />
                          <span>Print Bill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Print & Settle Modal */}
      <AdminBillModal
        isOpen={Boolean(selectedBillOrder)}
        table={{ id: selectedBillOrder?.table, number: selectedBillOrder?.table_number }}
        activeOrder={selectedBillOrder}
        onClose={() => setSelectedBillOrder(null)}
        onBillSettled={() => {
          setSelectedBillOrder(null);
          loadOrders();
        }}
      />

      {/* Parcel Orders Modal */}
      <AdminParcelModal
        isOpen={isParcelModalOpen}
        onClose={() => setIsParcelModalOpen(false)}
        onOrderCreated={() => {
          loadOrders();
        }}
      />
    </div>
  );
};

export default AdminOrdersPage;
