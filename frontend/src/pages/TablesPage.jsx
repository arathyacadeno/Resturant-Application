import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tablesApi } from '../api/tablesApi';
import { useOrder } from '../context/OrderContext';
import { Plus, RefreshCw } from 'lucide-react';

// Reusable status styling configuration mapping database values to UI styles
const STATUS_STYLES = {
  available: {
    statusClass: 'available',
    label: 'Available',
    numColor: '#16833F',
    badgeBg: '#C7CE9F',
    badgeText: '#16833F',
    dotColor: '#16833F',
    cardBg: '#E5E8C8',
  },
  occupied: {
    statusClass: 'occupied',
    label: 'Occupied',
    numColor: '#B91C1C',
    badgeBg: '#EEA79B',
    badgeText: '#B91C1C',
    dotColor: '#B91C1C',
    cardBg: '#FADCD5',
  },
  reserved: {
    statusClass: 'reserved',
    label: 'Reserved',
    numColor: '#1D4ED8',
    badgeBg: '#85A8E1',
    badgeText: '#FFFFFF',
    dotColor: '#FFFFFF',
    cardBg: '#DCDDDF',
  },
  billing: {
    statusClass: 'billing',
    label: 'Billing',
    numColor: '#B46900',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    dotColor: '#FFFFFF',
    cardBg: '#F7E4C8',
  },
  cleaning: {
    statusClass: 'billing',
    label: 'Cleaning',
    numColor: '#B46900',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    dotColor: '#FFFFFF',
    cardBg: '#F7E4C8',
  },
};

const getStatusConfig = (rawStatus) => {
  const key = rawStatus ? String(rawStatus).toLowerCase() : 'available';
  return (
    STATUS_STYLES[key] || {
      statusClass: 'available',
      label: rawStatus ? String(rawStatus).charAt(0).toUpperCase() + String(rawStatus).slice(1) : 'Available',
      numColor: '#16833F',
      badgeBg: '#C7CE9F',
      badgeText: '#16833F',
      dotColor: '#16833F',
      cardBg: '#E5E8C8',
    }
  );
};

export const TablesPage = () => {
  const navigate = useNavigate();
  const { setSelectedTable } = useOrder();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter State: 'All', 'Indoor', 'Terrace'
  const [activeFilter, setActiveFilter] = useState('All');

  // New Table Form State
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [floorSection, setFloorSection] = useState('indoor');

  // Fetch real database tables
  const loadTables = async () => {
    try {
      const data = await tablesApi.getTables();
      const loaded = data.results || data;
      if (Array.isArray(loaded)) {
        setTables(loaded);
      }
    } catch (err) {
      console.error('Failed to load tables from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();

    // Auto-sync table status changes live
    const handleFocus = () => loadTables();
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      loadTables();
    }, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      await tablesApi.createTable({
        number: tableNumber.startsWith('T') ? tableNumber : `T${tableNumber}`,
        name: `Table ${tableNumber}`,
        capacity: parseInt(capacity),
        section: floorSection.toLowerCase(),
      });
      setShowAddModal(false);
      setTableNumber('');
      loadTables();
    } catch (err) {
      alert(err.response?.data?.number?.[0] || err.response?.data?.detail || 'Failed to create table');
    }
  };

  const handleSelectTableForOrder = (table) => {
    setSelectedTable(table);
    navigate('/pos');
  };

  // Dynamic Statistics computed strictly from backend database tables
  const freeCount = tables.filter(
    (t) => (t.status || '').toLowerCase() === 'available'
  ).length;
  
  const occupiedCount = tables.filter((t) =>
    ['occupied', 'billing', 'cleaning'].includes((t.status || '').toLowerCase())
  ).length;
  
  const totalCount = tables.length;

  // Filter backend tables dynamically by section
  const filteredTables = tables.filter((t) => {
    if (activeFilter === 'All') return true;
    const sec = (t.section || '').toLowerCase();
    if (activeFilter === 'Indoor') {
      return sec === 'indoor' || sec === 'main' || sec === '' || !t.section;
    }
    if (activeFilter === 'Terrace') {
      return sec === 'terrace' || sec === 'outdoor';
    }
    return true;
  });

  // Format table number cleanly (e.g. "1" -> "T1", "T2" -> "T2")
  const formatTableNumber = (num) => {
    if (!num) return 'T1';
    const str = String(num).trim();
    return str.startsWith('T') || str.startsWith('t') ? str.toUpperCase() : `T${str}`;
  };

  // Chair icon matching reference
  const ChairIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/>
      <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
      <path d="M5 18v3"/>
      <path d="M19 18v3"/>
    </svg>
  );

  return (
    <div className="tables-overview-container">
      {/* Page Header */}
      <div className="mobile-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Table Overview</h1>
          <p>Tap a table to view or start an order</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', color: '#171717', borderRadius: '14px' }} onClick={loadTables}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" style={{ background: '#E87500', borderColor: '#E87500', color: '#ffffff', borderRadius: '14px', fontWeight: 700 }} onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Table
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="unified-stats-row">
        <div className="mobile-stat-card">
          <span className="stat-num-free">{freeCount}</span>
          <span className="stat-label-text">FREE</span>
        </div>

        <div className="mobile-stat-card">
          <span className="stat-num-occupied">{occupiedCount}</span>
          <span className="stat-label-text">OCCUPIED</span>
        </div>

        <div className="mobile-stat-card">
          <span className="stat-num-total">{totalCount}</span>
          <span className="stat-label-text">TOTAL</span>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="mobile-filter-pills">
        <button
          className={`filter-pill ${activeFilter === 'All' ? 'active' : ''}`}
          onClick={() => setActiveFilter('All')}
        >
          All
        </button>
        <button
          className={`filter-pill ${activeFilter === 'Indoor' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Indoor')}
        >
          Indoor
        </button>
        <button
          className={`filter-pill ${activeFilter === 'Terrace' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Terrace')}
        >
          Terrace
        </button>
      </div>

      {/* Responsive Table Cards Grid (4 cols desktop, 3 cols tablet, 2 cols mobile) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#786C65' }}>
          Loading dining floor tables...
        </div>
      ) : filteredTables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#786C65', background: '#ffffff', borderRadius: '18px' }}>
          No tables match the selected filter.
        </div>
      ) : (
        <div className="unified-table-grid">
          {filteredTables.map((table) => {
            const statusConfig = getStatusConfig(table.status);

            return (
              <div
                key={table.id}
                className={`table-card-mobile ${statusConfig.statusClass}`}
                onClick={() => handleSelectTableForOrder(table)}
                style={{ minHeight: '150px' }}
              >
                <div>
                  <div className="table-card-num" style={{ fontSize: '1.9rem', fontWeight: 800 }}>
                    {formatTableNumber(table.number)}
                  </div>
                  <div className="table-card-seats">
                    <ChairIcon />
                    <span>{table.capacity || 4} seats</span>
                  </div>
                </div>

                <div className="status-badge">
                  <span className="badge-dot"></span>
                  <span>{statusConfig.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add New Table */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Dining Table</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTable}>
              <div className="form-group">
                <label>Table Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1 or T12"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Seating Capacity</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 4"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Floor Section</label>
                <select
                  className="form-select"
                  value={floorSection}
                  onChange={(e) => setFloorSection(e.target.value)}
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="terrace">Terrace</option>
                  <option value="private">Private Room</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#E87500', borderColor: '#E87500' }}>
                Create Dining Table
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
