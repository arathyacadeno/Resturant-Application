import React, { useState, useEffect } from 'react';
import { menuApi } from '../../api/menuApi';
import { Search } from 'lucide-react';

export const AdminMenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const loadMenuData = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.allSettled([
        menuApi.getCategories(),
        menuApi.getMenuItems(),
      ]);

      if (catRes.status === 'fulfilled') {
        const list = catRes.value.results || catRes.value;
        if (Array.isArray(list)) setCategories(list);
      }

      if (itemRes.status === 'fulfilled') {
        const list = itemRes.value.results || itemRes.value;
        if (Array.isArray(list)) setMenuItems(list);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = activeCategory === 'All' || String(item.category) === String(activeCategory);
    const matchesSearch =
      !search ||
      (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleAvailability = async (item) => {
    try {
      await menuApi.updateMenuItem(item.id, { is_available: !item.is_available });
      loadMenuData();
    } catch (err) {
      alert('Failed to update item availability');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div className="admin-portal-card admin-top-card">
        <div className="admin-top-header">
          <div className="admin-top-greeting">
            <h1>Menu Catalogue</h1>
            <p>Manage categories, item pricing variants, and kitchen availability.</p>
          </div>

          <div className="admin-top-actions">
            <div className="admin-search-pill">
              <input
                type="text"
                placeholder="Search menu..."
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
            <h2>Food & Beverage Items</h2>
            <p>Showing {filteredItems.length} items</p>
          </div>

          <div className="admin-filter-pill-container" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`admin-filter-pill-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`admin-filter-pill-btn ${String(activeCategory) === String(c.id) ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#756B66' }}>Loading menu items...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#756B66' }}>No menu items found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #EAE1D8',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(70, 40, 25, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{item.name}</h3>
                  <span style={{ fontWeight: 800, color: '#B77D56' }}>₹{item.price}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#756B66', flex: 1 }}>
                  {item.description || 'Delicious freshly prepared recipe'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: item.is_available ? '#16A34A' : '#DC2626',
                    }}
                  >
                    {item.is_available ? '● Available' : '● Out of Stock'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAvailability(item)}
                    style={{
                      border: '1px solid #EAE1D8',
                      background: item.is_available ? '#FEE2E2' : '#DCFCE7',
                      color: item.is_available ? '#DC2626' : '#16A34A',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {item.is_available ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMenuPage;
