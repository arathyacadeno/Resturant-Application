import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tablesApi } from '../api/tablesApi';
import { useOrder } from '../context/OrderContext';
import { Plus, QrCode, RefreshCw, Trash2, Users } from 'lucide-react';

// Reusable status styling configuration mapping database values to UI styles
const STATUS_STYLES = {
  available: {
    statusClass: 'available',
    label: 'Available',
    numColor: '#15803D',
    badgeBg: '#C7CE9F',
    badgeText: '#15803D',
    dotColor: '#15803D',
    cardBg: '#E3E5C8',
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
      numColor: '#15803D',
      badgeBg: '#C7CE9F',
      badgeText: '#15803D',
      dotColor: '#15803D',
      cardBg: '#E3E5C8',
    }
  );
};

export const TablesPage = () => {
  const navigate = useNavigate();
  const { setSelectedTable } = useOrder();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);

  // Mobile Filter State: 'All', 'Indoor', 'Terrace'
  const [activeFilter, setActiveFilter] = useState('All');

  // New Table Form State
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [floorSection, setFloorSection] = useState('indoor');

  // Fetch real tables directly from Database API
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

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await tablesApi.updateStatus(tableId, newStatus);
      loadTables();
    } catch (err) {
      alert('Failed to update table status');
    }
  };

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

  const handleDeleteTable = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await tablesApi.deleteTable(id);
        loadTables();
      } catch (err) {
        alert('Failed to delete table');
      }
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

  const getStatusBadgeDesktop = (status) => {
    const config = getStatusConfig(status);
    switch (config.statusClass) {
      case 'available':
        return <span className="badge badge-green">Available</span>;
      case 'occupied':
        return <span className="badge badge-red">Occupied</span>;
      case 'reserved':
        return <span className="badge badge-amber">Reserved</span>;
      case 'billing':
        return <span className="badge badge-blue">Billing</span>;
      default:
        return <span className="badge badge-blue">{config.label}</span>;
    }
  };

  // Format table number cleanly (e.g. "1" -> "T1", "T2" -> "T2")
  const formatTableNumber = (num) => {
    if (!num) return 'T1';
    const str = String(num).trim();
    return str.startsWith('T') || str.startsWith('t') ? str.toUpperCase() : `T${str}`;
  };

  // Chair icon matching reference
  const ChairIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/>
      <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
      <path d="M5 18v3"/>
      <path d="M19 18v3"/>
    </svg>
  );

  return (
    <div>
      {/* ==================== DESKTOP TABLE VIEW (>768px) ==================== */}
      <div className="desktop-tables-wrapper">
        <div className="page-header">
          <div className="page-title">
            <h1>Dining Floor & Table Layout</h1>
            <p>Manage dining tables, occupancy, and QR code access tokens</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={loadTables}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Table
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading dining tables from database...
          </div>
        ) : tables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No dining tables found in database. Click "Add Table" to create one.
          </div>
        ) : (
          <div className="grid-4">
            {tables.map((table) => (
              <div key={table.id} className="glass-card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem' }}>Table #{table.number}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {table.section || 'Indoor'}
                    </span>
                  </div>
                  {getStatusBadgeDesktop(table.status)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Users size={16} />
                  <span>{table.capacity || 4} Capacity Seats</span>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Change Status</label>
                  <select
                    className="form-select"
                    value={table.status || 'available'}
                    onChange={(e) => handleStatusChange(table.id, e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="billing">Billing</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleSelectTableForOrder(table)}
                  >
                    Start Order
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowQRModal(table)}
                  >
                    <QrCode size={14} />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteTable(table.id)}
                    title="Delete Table"
                  >
                    <Trash2 size={14} color="var(--status-danger)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== MOBILE TABLE SECTION VIEW (≤768px) ==================== */}
      <div className="mobile-tables-wrapper">
        <div className="mobile-table-header">
          <h1>Table Overview</h1>
          <p>Tap a table to view or start an order</p>
        </div>

        {/* Dynamic Database Statistics Cards */}
        <div className="mobile-stats-row">
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

        {/* Database Section Filter Pills */}
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

        {/* 2-Column Responsive Grid of Database Tables */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#786C65' }}>
            Loading tables...
          </div>
        ) : filteredTables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#786C65' }}>
            No tables match the selected filter.
          </div>
        ) : (
          <div className="mobile-table-grid">
            {filteredTables.map((table) => {
              const statusConfig = getStatusConfig(table.status);

              return (
                <div
                  key={table.id}
                  className={`table-card-mobile ${statusConfig.statusClass}`}
                  onClick={() => handleSelectTableForOrder(table)}
                >
                  <div>
                    <div className="table-card-num">{formatTableNumber(table.number)}</div>
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
      </div>

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

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Dining Table
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: QR Code Details */}
      {showQRModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h2>Table #{showQRModal.number} Digital Token</h2>
              <button className="modal-close" onClick={() => setShowQRModal(null)}>×</button>
            </div>
            <div style={{ padding: '2rem 1rem', background: '#ffffff', borderRadius: 'var(--radius-md)', margin: '1rem 0' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                T-CLOCK RESTO CAFE
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b', marginBottom: '1rem' }}>
                TABLE {showQRModal.number}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>
                Token UUID: {showQRModal.qr_token || 'Generated by system'}
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Customers can scan table QR code to view digital menu or place self orders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
