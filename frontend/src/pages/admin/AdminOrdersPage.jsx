import React, { useState, useEffect } from 'react';
import { ordersApi } from '../../api/ordersApi';
import { Search } from 'lucide-react';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div className="admin-portal-card admin-top-card" style={{ gap: '1rem' }}>
        <div className="admin-top-header">
          <div className="admin-top-greeting">
            <h1>Order History & Billing</h1>
            <p>Track all live orders, kitchen statuses, and settled bills.</p>
          </div>

          <div className="admin-top-actions">
            <div className="admin-search-pill">
              <input
                type="text"
                placeholder="Search orders, tables..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="button" className="admin-search-icon-btn">
                <Search size={16} color="#FFFFFF" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-portal-card admin-overview-card">
        <div className="admin-overview-header">
          <div className="admin-overview-title">
            <h2>All Orders</h2>
            <p>Showing {filteredOrders.length} records</p>
          </div>

          <div className="admin-filter-pill-container">
            {['all', 'placed', 'preparing', 'ready', 'served', 'billed'].map((st) => (
              <button
                key={st}
                type="button"
                className={`admin-filter-pill-btn ${filterStatus === st ? 'active' : ''}`}
                onClick={() => setFilterStatus(st)}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>

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
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #F4EAE0', fontSize: '0.9rem' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>#{ord.id}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Table {ord.table_number || ord.table}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#6B5E55' }}>
                      {ord.items?.length || 0} items
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
