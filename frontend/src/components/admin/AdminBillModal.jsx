import React, { useState, useEffect } from 'react';
import { Printer, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { billingApi } from '../../api/billingApi';
import { ordersApi } from '../../api/ordersApi';
import { formatAdminTableNumber } from './AdminTableCard';

/**
 * AdminBillModal
 *
 * Centered Bill Print & Settlement Modal for Admin Dashboard matching reference design:
 * - Darkened + blurred backdrop
 * - Centered white/light-gray card with rounded corners & shadow
 * - Top header with table title, print button, and close 'X' button
 * - Receipt-style bill preview with restaurant metadata, order items, taxes, and footer
 * - GST Selector (Include 5% GST vs Exclude GST) with real-time recalculation
 * - Single-select Payment Method (Cash, GPay, Card, UPI)
 * - Full-width "Settle Bill" action button to complete the bill in Django backend
 * - Clean printer-friendly print functionality
 */
export const AdminBillModal = ({
  isOpen,
  onClose,
  table,
  activeOrder: initialOrder,
  onBillSettled,
}) => {
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Billing state
  const [isIncludeGst, setIsIncludeGst] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [settlingBill, setSettlingBill] = useState(false);

  // Fetch active order data for table if needed
  useEffect(() => {
    if (!isOpen) {
      setOrder(null);
      setError(null);
      return;
    }

    if (initialOrder && initialOrder.items && initialOrder.items.length > 0) {
      setOrder(initialOrder);
      return;
    }

    const fetchOrderForTable = async () => {
      if (!table?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await ordersApi.getActiveTableOrder(table.id);
        const fetchedOrder = data.order !== undefined ? data.order : data;
        if (fetchedOrder && fetchedOrder.id) {
          setOrder(fetchedOrder);
        } else if (initialOrder) {
          setOrder(initialOrder);
        } else {
          // Check if there is an existing bill for this table
          const allOrders = await ordersApi.getOrders({ table: table.id });
          const list = allOrders.results || allOrders;
          if (Array.isArray(list) && list.length > 0) {
            setOrder(list[0]);
          } else {
            setError('No active order found for this table.');
          }
        }
      } catch (err) {
        console.error('Failed to load table order for bill:', err);
        if (initialOrder) {
          setOrder(initialOrder);
        } else {
          setError('Failed to load order details for this table.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderForTable();
  }, [isOpen, table, initialOrder]);

  if (!isOpen) return null;

  // Compute subtotal, tax and total dynamically
  const subtotal = order
    ? parseFloat(order.subtotal || order.total_amount || order.total || 0)
    : 0;
  const gstAmount = isIncludeGst ? (subtotal * 5) / 100 : 0;
  const totalAmount = subtotal + gstAmount;

  const tableDisplayName = table?.number
    ? formatAdminTableNumber(table.number).replace('T ', 'Table ')
    : order?.table_number
    ? `Table ${String(order.table_number).replace(/\D/g, '')}`
    : 'Table Bill';

  const orderDateStr = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  // Trigger Print
  const handlePrint = (e) => {
    e?.stopPropagation();
    window.print();
  };

  // Settle Bill API Handler
  const handleSettleBill = async () => {
    if (!order?.id) {
      alert('Cannot settle bill without an active order.');
      return;
    }

    setSettlingBill(true);
    try {
      await billingApi.generateBill({
        order_id: order.id,
        include_gst: isIncludeGst,
        tax_percent: 5.0,
        discount_amount: 0,
        discount_reason: '',
        payment_method: selectedPaymentMethod,
        notes: '',
      });

      if (onBillSettled) {
        onBillSettled(table, order);
      }
      onClose();
    } catch (err) {
      console.error('Failed to settle bill:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        'Failed to settle bill. Please try again.';
      alert(msg);
    } finally {
      setSettlingBill(false);
    }
  };

  return (
    <div className="admin-bill-modal-overlay" onClick={onClose}>
      <div className="admin-bill-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Modal Header: Table Name + Print + Close ── */}
        <div className="admin-bill-modal-header">
          <h2 className="admin-bill-modal-title">{tableDisplayName}</h2>
          <div className="admin-bill-modal-actions">
            <button
              type="button"
              className="admin-bill-print-btn"
              onClick={handlePrint}
              title="Print Receipt"
            >
              <Printer size={18} color="#B87F00" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="admin-bill-close-btn"
              onClick={onClose}
              title="Close"
              aria-label="Close"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
            <p>Loading order details...</p>
          </div>
        ) : error && !order ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: '#EF4444' }}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.8 }} />
            <p style={{ fontWeight: 600 }}>{error}</p>
          </div>
        ) : (
          <>
            {/* ── Bill Preview White Card ── */}
            <div className="bill-preview" id="admin-bill-preview">
              <div className="resto-header">
                <h3 className="resto-name">T CLOCK RESTO CAFE</h3>
                <p className="resto-tagline">Time for Tea, Time for Taste</p>
                <p className="resto-address">
                  Main Road, Calicut, Kerala<br />
                  Ph: +91 98765 43210 · GSTIN: 32ABCDE1234F1Z5
                </p>
              </div>

              <div className="bill-divider" />

              {/* Meta Grid */}
              <div className="bill-meta-grid">
                <div className="bill-meta-row">
                  <span>Date</span>
                  <span className="bill-meta-val">{orderDateStr}</span>
                </div>
                <div className="bill-meta-row">
                  <span>Type / Table</span>
                  <span className="bill-meta-val">{tableDisplayName}</span>
                </div>
                <div className="bill-meta-row">
                  <span>Order #</span>
                  <span className="bill-meta-val">{order?.id ? `ORD-${order.id}` : 'N/A'}</span>
                </div>
              </div>

              <div className="bill-divider" />

              {/* Items List */}
              <div className="bill-items-list">
                {order?.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="bill-item-line">
                      <span>
                        {item.quantity}× {item.item_name || item.menu_item_name || item.name || 'Item'}
                      </span>
                      <span>₹{(parseFloat(item.unit_price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="bill-item-line">
                    <span>Dine-In Order Items</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="bill-divider" />

              {/* Calculations */}
              <div className="bill-calc-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {isIncludeGst && (
                <div className="bill-calc-row">
                  <span>GST (5%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="bill-divider-thick" />

              <div className="bill-total-row">
                <span>TOTAL</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="bill-footer-msg">
                Thank you for visiting T Clock<br />Resto Cafe! 🌿
              </div>
            </div>

            {/* ── GST Section: Include vs Exclude ── */}
            <div className="gst-selector-container">
              <button
                type="button"
                className={`gst-option-btn ${isIncludeGst ? 'active' : ''}`}
                onClick={() => setIsIncludeGst(true)}
              >
                {isIncludeGst ? (
                  <CheckCircle size={15} color="#18834B" />
                ) : (
                  <XCircle size={15} color="#94A3B8" />
                )}
                <span>Include GST (5%)</span>
              </button>

              <button
                type="button"
                className={`gst-option-btn ${!isIncludeGst ? 'active' : ''}`}
                onClick={() => setIsIncludeGst(false)}
              >
                {!isIncludeGst ? (
                  <CheckCircle size={15} color="#18834B" />
                ) : (
                  <XCircle size={15} color="#94A3B8" />
                )}
                <span>Exclude GST</span>
              </button>
            </div>

            {/* ── Payment Method Selector ── */}
            <div className="payment-method-container">
              <div className="payment-section-label">SELECT PAYMENT METHOD</div>
              <div className="payment-grid-2x2">
                <button
                  type="button"
                  className={`payment-method-card ${selectedPaymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setSelectedPaymentMethod('cash')}
                >
                  By Cash
                </button>
                <button
                  type="button"
                  className={`payment-method-card ${selectedPaymentMethod === 'gpay' ? 'active' : ''}`}
                  onClick={() => setSelectedPaymentMethod('gpay')}
                >
                  Google Pay
                </button>
                <button
                  type="button"
                  className={`payment-method-card ${selectedPaymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setSelectedPaymentMethod('card')}
                >
                  Credit / Debit
                </button>
                <button
                  type="button"
                  className={`payment-method-card ${selectedPaymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setSelectedPaymentMethod('upi')}
                >
                  UPI (Pay via any App)
                </button>
              </div>
            </div>

            {/* ── Settle Bill Action Button ── */}
            <div className="settle-bill-container">
              <button
                type="button"
                className="settle-bill-btn"
                onClick={handleSettleBill}
                disabled={settlingBill}
              >
                {settlingBill ? 'Settling...' : 'Settle Bill'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBillModal;
