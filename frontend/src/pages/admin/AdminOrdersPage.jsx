import React, { useState, useEffect } from 'react';
import { ordersApi } from '../../api/ordersApi';
import { Search, Printer } from 'lucide-react';
import { AdminBillModal } from '../../components/admin/AdminBillModal';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBillOrder, setSelectedBillOrder] = useState(null);

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
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      !search ||
      String(o.id).includes(search) ||
      String(o.table_number || '').includes(search) ||
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase());
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
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="admin-filter-pill-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['all', 'pending', 'preparing', 'ready', 'billed', 'cancelled'].map((st) => (
          <button
            key={st}
            type="button"
            className={`admin-filter-pill-btn ${filterStatus === st ? 'active' : ''}`}
            onClick={() => setFilterStatus(st)}
            style={{
              padding: '6px 18px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: filterStatus === st ? '#2A160F' : '#FFFFFF',
              color: filterStatus === st ? '#FFFFFF' : '#6B5E55',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease'
            }}
          >
            {st.charAt(0).toUpperCase() + st.slice(1)}
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
                  <th style={{ padding: '0.75rem 1rem' }}>Table</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #F4EAE0', fontSize: '0.9rem' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>#{ord.id}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Table {ord.table_number || ord.table}</td>
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
                ))}
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
    </div>
  );
};

export default AdminOrdersPage;
