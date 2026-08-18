import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tablesApi } from '../api/tablesApi';
import { useOrder } from '../context/OrderContext';
import { Plus, RefreshCw, QrCode } from 'lucide-react';

// Reusable status styling configuration matching Image 1 & Figma target specs
const STATUS_STYLES = {
  available: {
    statusClass: 'available',
    label: 'Available',
    numColor: '#2C8238',
    badgeBg: '#C7CE9F',
    badgeText: '#2C8238',
    dotColor: '#2C8238',
    cardBg: '#E5E3C5',
  },
  occupied: {
    statusClass: 'occupied',
    label: 'Occupied',
    numColor: '#B92722',
    badgeBg: '#EEA79B',
    badgeText: '#B92722',
    dotColor: '#B92722',
    cardBg: '#F8CDBD',
  },
  reserved: {
    statusClass: 'reserved',
    label: 'Reserved',
    numColor: '#075985',
    badgeBg: '#85A8E1',
    badgeText: '#FFFFFF',
    dotColor: '#FFFFFF',
    cardBg: '#D8D5D6',
  },
  billing: {
    statusClass: 'billing',
    label: 'Billing',
    numColor: '#C49100',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    dotColor: '#FFFFFF',
    cardBg: '#F8DDB8',
  },
  cleaning: {
    statusClass: 'billing',
    label: 'Cleaning',
    numColor: '#C49100',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    dotColor: '#FFFFFF',
    cardBg: '#F8DDB8',
  },
};

const getStatusConfig = (rawStatus) => {
  const key = rawStatus ? String(rawStatus).toLowerCase() : 'available';
  return (
    STATUS_STYLES[key] || {
      statusClass: 'available',
      label: rawStatus ? String(rawStatus).charAt(0).toUpperCase() + String(rawStatus).slice(1) : 'Available',
      numColor: '#2C8238',
      badgeBg: '#C7CE9F',
      badgeText: '#2C8238',
      dotColor: '#2C8238',
      cardBg: '#E5E3C5',
    }
  );
};

export const TablesPage = () => {
  const navigate = useNavigate();
  const { setSelectedTable } = useOrder();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter State: 'All', 'Indoor', 'Out door' (Target Image 1)
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
    if (activeFilter === 'Out door') {
      return sec === 'outdoor' || sec === 'terrace' || sec === 'out door';
    }
    return true;
  });

  // Natural sorting by table number: T1, T2, T3, T4, T5, T6, T7, T8, T9, T10...
  const sortedTables = [...filteredTables].sort((a, b) => {
    const numA = parseInt(String(a.number).replace(/\D/g, '')) || 0;
    const numB = parseInt(String(b.number).replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  // Format table number cleanly (e.g. "1" -> "T1", "T2" -> "T2")
  const formatTableNumber = (num) => {
    if (!num) return 'T1';
    const str = String(num).trim();
    return str.startsWith('T') || str.startsWith('t') ? str.toUpperCase() : `T${str}`;
  };

  // Chair icon matching reference
  const ChairIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/>
      <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
      <path d="M5 18v3"/>
      <path d="M19 18v3"/>
    </svg>
  );

  return (
    <div className="tables-overview-container">
      {/* Page Header */}
      <div className="mobile-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111111', margin: 0, lineHeight: '27px' }}>Table Overview</h1>
          <p style={{ fontSize: '14px', color: '#333333', fontWeight: 400, marginTop: '4px', margin: 0 }}>Tap a table to view or start an order</p>
        </div>
        <div className="desktop-only-actions" style={{ display: 'flex', gap: '0.75rem' }}>
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
          className={`filter-pill ${activeFilter === 'Out door' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Out door')}
        >
          Out door
        </button>
      </div>

      {/* Responsive Table Cards Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#786C65' }}>
          Loading dining floor tables...
        </div>
      ) : sortedTables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#786C65', background: '#ffffff', borderRadius: '24px' }}>
          No tables match the selected filter.
        </div>
      ) : (
        <div className="unified-table-grid">
          {sortedTables.map((table, index) => {
            const statusConfig = getStatusConfig(table.status);
            
            // Location info matching Image 1: T1 -> Indoor, T2 -> Out door (or from DB)
            const rawSec = (table.section || '').toLowerCase();
            let sectionText = null;
            if (rawSec.includes('out')) {
              sectionText = 'Out door';
            } else if (rawSec.includes('in')) {
              sectionText = 'Indoor';
            } else if (table.number === '1' || table.number === 'T1' || index === 0) {
              sectionText = 'Indoor';
            } else if (table.number === '2' || table.number === 'T2' || index === 1) {
              sectionText = 'Out door';
            }

            return (
              <div
                key={table.id}
                className={`table-card-mobile ${statusConfig.statusClass}`}
                onClick={() => handleSelectTableForOrder(table)}
                style={{ backgroundColor: statusConfig.cardBg }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="table-card-num" style={{ color: statusConfig.numColor }}>
                      {formatTableNumber(table.number)}
                    </div>
                    <QrCode size={20} style={{ color: '#111111', opacity: 0.85, marginTop: '2px' }} />
                  </div>

                  <div className="table-card-seats">
                    <ChairIcon />
                    <span>{table.capacity || 4} seats</span>
                  </div>

                  {sectionText && (
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#111111', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '8px' }}>●</span>
                      <span>{sectionText}</span>
                    </div>
                  )}
                </div>

                <div className="status-badge" style={{ backgroundColor: statusConfig.badgeBg, color: statusConfig.badgeText }}>
                  <span className="badge-dot" style={{ backgroundColor: statusConfig.dotColor }}></span>
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
