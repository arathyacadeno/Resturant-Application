import React, { useState, useEffect } from 'react';
import { billingApi } from '../api/billingApi';
import { ordersApi } from '../api/ordersApi';
import { authApi } from '../api/authApi';
import { Receipt, Printer, Share2, Plus, RefreshCw, CheckCircle, CreditCard } from 'lucide-react';

export const BillingPage = () => {
  const [bills, setBills] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(null);

  // Generate Bill Form
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5); // default 5% GST
  const [paymentMode, setPaymentMode] = useState('cash');

  const loadData = async () => {
    setLoading(true);
    try {
      const [billsRes, ordersRes, settingsRes] = await Promise.all([
        billingApi.getBills(),
        ordersApi.getOrders(),
        authApi.getSettings(),
      ]);

      const loadedBills = billsRes.results || billsRes;
      setBills(Array.isArray(loadedBills) ? loadedBills : []);

      const allOrders = ordersRes.results || ordersRes;
      if (Array.isArray(allOrders)) {
        // Filter active unbilled orders (e.g. ready, served, preparing, confirmed, pending)
        const unbilled = allOrders.filter(
          (o) => o.status !== 'billed' && o.status !== 'cancelled'
        );
        setActiveOrders(unbilled);
      } else {
        setActiveOrders([]);
      }

      setSettings(settingsRes);
    } catch (err) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto refresh every 6 seconds so incoming ready kitchen orders update live
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenGenerateForOrder = (orderId) => {
    setSelectedOrderId(String(orderId));
    setShowGenerateModal(true);
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert('Please select an order to generate bill for');
      return;
    }

    const orderObj = activeOrders.find((o) => o.id === parseInt(selectedOrderId));
    const subtotalVal = orderObj ? parseFloat(orderObj.subtotal || 0) : 0;
    const discountAmt = (subtotalVal * (parseFloat(discountPercent || 0) / 100)) || 0;

    try {
      const billData = await billingApi.generateBill({
        order_id: parseInt(selectedOrderId),
        tax_percent: parseFloat(taxPercent || 5),
        discount_amount: discountAmt,
        payment_method: paymentMode,
      });
      setShowGenerateModal(false);
      setShowReceiptModal(billData);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.error || 'Failed to generate bill');
    }
  };

  const handleShareWhatsApp = async (billId) => {
    try {
      const data = await billingApi.getWhatsAppText(billId);
      const text = data.whatsapp_text || data.text || '';
      const phone = (data.customer_phone || '').replace(/\D/g, '');
      const encodedText = encodeURIComponent(text);

      const targetPhone = phone.length === 10 ? `91${phone}` : phone;
      const whatsappUrl = targetPhone
        ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`
        : `https://api.whatsapp.com/send?text=${encodedText}`;

      window.open(whatsappUrl, '_blank');
    } catch (err) {
      alert('Failed to open WhatsApp');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Billing & Invoicing</h1>
          <p>Generate customer invoices, record payments, and print receipts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
            <Plus size={16} /> Generate New Bill
          </button>
        </div>
      </div>

      {/* ==================== ACTIVE UNBILLED ORDERS SECTION ==================== */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem', color: '#171717', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={20} color="#d97706" />
          <span>Active Orders Pending Payment ({activeOrders.length})</span>
        </h2>

        {activeOrders.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            No pending orders waiting for payment. Incoming orders ready from kitchen will appear here automatically.
          </div>
        ) : (
          <div className="grid-3" style={{ gap: '1rem' }}>
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                className="glass-card"
                style={{
                  borderLeft: ord.status === 'ready' ? '4px solid var(--status-success)' : '4px solid var(--accent-amber)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.15rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Order #{ord.id}</h3>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                        {ord.table ? `Table ${ord.table}` : (ord.order_type || 'Dine-In').toUpperCase()}
                      </span>
                    </div>
                    <span className={`badge ${ord.status === 'ready' ? 'badge-green' : 'badge-amber'}`} style={{ textTransform: 'capitalize' }}>
                      {ord.status}
                    </span>
                  </div>

                  {ord.customer_name && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Customer: <strong>{ord.customer_name}</strong>
                    </div>
                  )}

                  {/* Order items snippet */}
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
                    {ord.items && ord.items.length > 0 ? (
                      ord.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.quantity}x {item.item_name || item.menu_item_name}</span>
                          <span>₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <span>Items summary in ticket</span>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subtotal</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#350707' }}>
                      ₹{parseFloat(ord.subtotal || 0).toFixed(2)}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#350707', border: 'none', borderRadius: '12px', padding: '0.5rem 1rem' }}
                    onClick={() => handleOpenGenerateForOrder(ord.id)}
                  >
                    <Receipt size={14} /> Generate Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== PAID BILLS HISTORY TABLE ==================== */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem', color: '#171717' }}>
        Invoices & Payment History
      </h2>

      {loading && bills.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading bills history...
        </div>
      ) : bills.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          No generated invoices found yet. Click <strong>Generate Bill</strong> above to bill an order.
        </div>
      ) : (
        <div className="glass-card">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Bill #</th>
                <th style={{ padding: '0.75rem 1rem' }}>Order Ref</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Payment</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Bill</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                    #{bill.bill_number || bill.id}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    Order #{bill.order}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(bill.created_at).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-amber" style={{ textTransform: 'uppercase' }}>
                      {bill.payment_method || 'CASH'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, fontSize: '1rem' }}>
                    ₹{parseFloat(bill.total || bill.total_amount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowReceiptModal(bill)}
                      >
                        <Printer size={14} /> Receipt
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleShareWhatsApp(bill.id)}
                        title="Share via WhatsApp"
                      >
                        <Share2 size={14} /> WhatsApp
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Generate Bill */}
      {showGenerateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Generate Bill & Tax Invoice</h2>
              <button className="modal-close" onClick={() => setShowGenerateModal(false)}>×</button>
            </div>

            <form onSubmit={handleGenerateBill}>
              <div className="form-group">
                <label>Select Order to Bill</label>
                <select
                  className="form-select"
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Active Order --</option>
                  {activeOrders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      Order #{ord.id} - {ord.table ? `Table ${ord.table}` : ord.order_type} (₹{ord.subtotal}) - {ord.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-input"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>GST Tax (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    className="form-input"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="cash">💵 Cash</option>
                  <option value="upi">📱 UPI / GPay / Paytm</option>
                  <option value="card">💳 Credit / Debit Card</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Calculate & Create Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Receipt */}
      {showReceiptModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px', color: '#0f172a', background: '#ffffff', borderRadius: 'var(--radius-md)' }}>
            <div className="modal-header" style={{ borderColor: '#e2e8f0' }}>
              <h3 style={{ color: '#0f172a' }}>Official Tax Invoice</h3>
              <button className="modal-close" style={{ color: '#0f172a' }} onClick={() => setShowReceiptModal(null)}>×</button>
            </div>

            <div id="printable-receipt" style={{ textAlign: 'center', margin: '1rem 0', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              <img 
                src="/logo.png" 
                alt="T-Clock Logo" 
                style={{ width: '70px', height: '70px', objectFit: 'contain', margin: '0 auto 0.5rem auto' }} 
              />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {settings?.name || 'T-CLOCK RESTO CAFE'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0' }}>
                {settings?.address || 'Main Road, Calicut, Kerala'}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Ph: {settings?.phone || '+91 98765 43210'} | GSTIN: {settings?.gstin || '32ABCDE1234F1Z5'}
              </p>

              <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', margin: '1rem 0', padding: '0.5rem 0', textAlign: 'left' }}>
                <div>Invoice #: {showReceiptModal.bill_number || `B-${showReceiptModal.id}`}</div>
                <div>Order #: #{showReceiptModal.order}</div>
                <div>Date: {new Date(showReceiptModal.created_at || Date.now()).toLocaleString('en-IN')}</div>
                <div>Payment Mode: {(showReceiptModal.payment_method || 'cash').toUpperCase()}</div>
              </div>

              <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(showReceiptModal.subtotal || 0).toFixed(2)}</span>
                </div>
                {parseFloat(showReceiptModal.discount_amount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>Discount:</span>
                    <span>-₹{parseFloat(showReceiptModal.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST Tax ({showReceiptModal.tax_percent || 5}%):</span>
                  <span>+₹{parseFloat(showReceiptModal.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #0f172a' }}>
                  <span>GRAND TOTAL:</span>
                  <span>₹{parseFloat(showReceiptModal.total || showReceiptModal.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              <p style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.75rem' }}>
                {settings?.footer || 'Thank you for visiting T Clock Resto Cafe! 🌴'}
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
