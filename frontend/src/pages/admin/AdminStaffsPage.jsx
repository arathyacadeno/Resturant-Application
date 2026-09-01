import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/authApi';
import { Users, UserPlus, Shield, Check, X, Phone, Mail } from 'lucide-react';

export const AdminStaffsPage = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStaffs = async () => {
    setLoading(true);
    try {
      const res = await authApi.getStaffUsers();
      const list = res.results || res;
      if (Array.isArray(list)) {
        setStaffs(list);
      }
    } catch (err) {
      console.error('Failed to load staffs:', err);
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div className="admin-portal-card admin-top-card">
        <div className="admin-top-header">
          <div className="admin-top-greeting">
            <h1>Staff Management</h1>
            <p>Manage staff accounts, kitchen operators, and system roles.</p>
          </div>
        </div>
      </div>

      <div className="admin-portal-card admin-overview-card">
        <div className="admin-overview-header">
          <div className="admin-overview-title">
            <h2>Active Restaurant Staff</h2>
            <p>{staffs.length} members configured</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#756B66' }}>Loading staff members...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {staffs.map((st) => (
              <div
                key={st.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #EAE1D8',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 2px 8px rgba(70, 40, 25, 0.04)',
                }}
              >
                <div
                  style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: '#F4EAE0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#2D0806',
                  }}
                >
                  {(st.first_name || st.username || 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{st.first_name || st.username}</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#8C827A' }}>
                    @{st.username} • {st.role?.toUpperCase() || 'STAFF'}
                  </p>
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: st.is_active ? '#DCFCE7' : '#FEE2E2',
                    color: st.is_active ? '#16A34A' : '#DC2626',
                  }}
                >
                  {st.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStaffsPage;
