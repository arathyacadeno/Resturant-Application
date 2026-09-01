import React from 'react';


export const AdminSettingsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div className="admin-portal-card admin-top-card">
        <div className="admin-top-header">
          <div className="admin-top-greeting">
            <h1>Restaurant Settings</h1>
            <p>Configure restaurant details, thermal printer options, and taxes.</p>
          </div>
        </div>
      </div>

      <div className="admin-portal-card admin-overview-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Restaurant Name
            </label>
            <input
              type="text"
              defaultValue="Tea Clock"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #EAE1D8',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              GST / Tax Percentage (%)
            </label>
            <input
              type="number"
              defaultValue="5"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #EAE1D8',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Default Currency
            </label>
            <input
              type="text"
              defaultValue="INR (₹)"
              disabled
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #EAE1D8',
                background: '#F9F6F0',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <button
            type="button"
            className="admin-add-table-pill"
            style={{ width: 'fit-content', marginTop: '0.5rem', padding: '10px 24px' }}
            onClick={() => alert('Settings saved successfully')}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
