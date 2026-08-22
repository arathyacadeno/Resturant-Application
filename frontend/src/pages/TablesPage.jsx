import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tablesApi } from '../api/tablesApi';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Plus, RefreshCw, QrCode } from 'lucide-react';

// Reusable status styling configuration matching reference image specs
const STATUS_STYLES = {
  available: {
    statusClass: 'available',
    label: 'Available',
    numColor: '#2C8238',
    badgeBg: '#C7CE9F',
    badgeText: '#2C8238',
    dotColor: '#2C8238',
    cardBg: '#E7E0C5',
  },
  occupied: {
    statusClass: 'occupied',
    label: 'Occupied',
    numColor: '#B92722',
    badgeBg: '#EEA79B',
    badgeText: '#B92722',
    dotColor: '#B92722',
    cardBg: '#C711001A',
  },
  reserved: {
    statusClass: 'reserved',
    label: 'Reserved',
    numColor: '#075985',
    badgeBg: '#85A8E1',
    badgeText: '#FFFFFF',
    dotColor: '#FFFFFF',
    cardBg: '#357EC333',
  },
  billing: {
    statusClass: 'billing',
    label: 'Billing',
    numColor: '#C49100',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    dotColor: '#FFFFFF',
    cardBg: '#F4D7AA',
  },
  cleaning: {
    statusClass: 'billing',
    label: 'Cleaning',
    numColor: '#C49100',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    dotColor: '#FFFFFF',
    cardBg: '#F4D7AA',
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
      cardBg: '#E7E0C5',
    }
  );
};

export const TablesPage = () => {
  const navigate = useNavigate();
  const { setSelectedTable } = useOrder();
  const { user, openProfile } = useAuth();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter State: 'All', 'Indoor', 'Out door'
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

  // Selected Table Bottom Sheet State
  const [selectedOccupiedTable, setSelectedOccupiedTable] = useState(null);
  const [selectedReservedTable, setSelectedReservedTable] = useState(null);
  const [selectedAvailableTable, setSelectedAvailableTable] = useState(null);
  const [showReserveForm, setShowReserveForm] = useState(false);

  // Reservation Form State
  const [guestName, setGuestName] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [resError, setResError] = useState(null);
  const [resSuccess, setResSuccess] = useState(null);
  const [isSubmittingRes, setIsSubmittingRes] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (selectedReservedTable) {
      setGuestName(selectedReservedTable.active_reservation?.guest_name || '');
      setArrivalTime(selectedReservedTable.active_reservation?.arrival_time || '');
      setResError(null);
      setShowCancelConfirm(false);
    }
  }, [selectedReservedTable]);

  useEffect(() => {
    if (selectedAvailableTable) {
      setGuestName('');
      setArrivalTime('');
      setResError(null);
      setShowReserveForm(false);
    }
  }, [selectedAvailableTable]);

  const formatArrivalTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = String(timeStr).split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      if (!isNaN(hours)) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
      }
    }
    return timeStr;
  };

  const handleSelectTableForOrder = (table) => {
    const isMobile = window.innerWidth <= 768;
    const status = (table.status || '').toLowerCase();
    
    if (isMobile) {
      if (['occupied', 'billing'].includes(status)) {
        setSelectedOccupiedTable(table);
        return;
      }
      if (status === 'reserved' || table.active_reservation) {
        setSelectedReservedTable(table);
        return;
      }
      if (status === 'available') {
        setSelectedAvailableTable(table);
        return;
      }
    }

    setSelectedTable(table);
    navigate('/pos');
  };

  const handleViewBill = (table) => {
    setSelectedTable(table);
    setSelectedOccupiedTable(null);
    navigate('/billing');
  };

  const handleViewOrder = (table) => {
    setSelectedTable(table);
    setSelectedOccupiedTable(null);
    navigate('/pos', { state: { openOrderSheet: true } });
  };

  const handleStartOrderFromReserved = async (table) => {
    try {
      if (tablesApi.updateStatus) {
        await tablesApi.updateStatus(table.id, 'occupied');
      }
      await loadTables();
    } catch (err) {
      console.error('Failed to update table status to occupied:', err);
    } finally {
      setSelectedTable(table);
      setSelectedReservedTable(null);
      navigate('/pos');
    }
  };

  const handleConfirmCancelReservation = async () => {
    if (!selectedReservedTable) return;
    try {
      if (selectedReservedTable.active_reservation?.id) {
        await tablesApi.cancelReservation(selectedReservedTable.active_reservation.id);
      } else {
        await tablesApi.updateStatus(selectedReservedTable.id, 'available');
      }
      setResSuccess('Reservation Cancelled');
      await loadTables();
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setShowCancelConfirm(false);
      setSelectedReservedTable(null);
      setTimeout(() => setResSuccess(null), 3000);
    }
  };

  const handleConfirmReservation = async (targetTable = null) => {
    const tableToReserve = targetTable || selectedReservedTable || selectedAvailableTable;
    if (!tableToReserve) return;

    if (!guestName.trim()) {
      setResError('Guest name is required');
      return;
    }
    if (!arrivalTime.trim()) {
      setResError('Arrival time is required');
      return;
    }

    setIsSubmittingRes(true);
    setResError(null);
    try {
      await tablesApi.createReservation(
        tableToReserve.id,
        guestName.trim(),
        arrivalTime.trim()
      );
      setResSuccess('Reservation Confirmed ✓');
      await loadTables();
      setSelectedReservedTable(null);
      setSelectedAvailableTable(null);
      setTimeout(() => {
        setResSuccess(null);
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create reservation';
      setResError(msg);
    } finally {
      setIsSubmittingRes(false);
    }
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

  // Natural sorting by table number: T 1, T 2, T 3, T 4...
  const sortedTables = [...filteredTables].sort((a, b) => {
    const numA = parseInt(String(a.number).replace(/\D/g, '')) || 0;
    const numB = parseInt(String(b.number).replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  // Format table number with space (e.g. "1" -> "T 1", "T2" -> "T 2")
  const formatTableNumber = (num) => {
    if (!num) return 'T 1';
    const str = String(num).trim().replace(/^T/i, '').trim();
    return `T ${str || '1'}`;
  };

  // Seated person icon matching attached reference image
  const SeatedPersonIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <circle cx="10" cy="3" r="2.2" />
      <path d="M 8.5 7 C 8.2 7 8 7.2 8.1 7.5 L 9.2 12.5 C 9.3 13 9.7 13.5 10.3 13.5 L 16.5 13.5 C 17.1 13.5 17.6 13.9 17.8 14.5 L 20 20 C 20.2 20.5 19.8 21 19.2 21 C 18.8 21 18.5 20.7 18.3 20.3 L 16.3 15.3 L 11.2 15.3 C 9.8 15.3 8.6 14.3 8.3 12.9 L 7.3 7.8 C 7.2 7.3 7.6 7 8.5 7 Z" />
      <path d="M 5 5 L 6.2 14.5 C 6.5 16.5 8 17.5 10 17.5 L 18 17.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="tables-overview-container">
      {/* Page Header with Dynamic User Avatar */}
      <div className="mobile-table-header">
        <div>
          <h1 className="table-title">Table Overview</h1>
          <p className="table-subtitle">Tap a table to view or start an order</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Mobile Profile Avatar Trigger */}
          <div
            onClick={openProfile}
            style={{ cursor: 'pointer' }}
            title="Open Profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="User Avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#F5F1EF', border: '1.5px solid #ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: '#350505' }}>
                {user?.username ? user.username[0].toUpperCase() : 'A'}
              </div>
            )}
          </div>

          <div className="desktop-only-actions" style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', color: '#171717', borderRadius: '14px' }} onClick={loadTables}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-primary" style={{ background: '#350505', borderColor: '#350505', color: '#ffffff', borderRadius: '14px', fontWeight: 700 }} onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Table
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="unified-stats-row">
        <div className="mobile-stat-card">
          <span className="stat-num-free">{freeCount}</span>
          <span className="stat-label-text">AVAILABLE</span>
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

      {/* Table Cards Grid */}
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
            
            // Location info matching reference image: T1 -> Indoor, T2 -> Out door (or from DB)
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
                  </div>

                  <div className="table-card-seats">
                    <img
                      src="/people-icon.png"
                      alt="Seats"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/Vector.png';
                      }}
                    />
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

      {/* Mobile Occupied Table Bottom-Sheet Detail Modal */}
      {selectedOccupiedTable && (
        <div className="table-modal-overlay" onClick={() => setSelectedOccupiedTable(null)}>
          <div className="occupied-table-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="occupied-sheet-header">
              <span className="occupied-sheet-location">
                {(selectedOccupiedTable.section || '').toLowerCase().includes('out')
                  ? 'Outdoor Seating'
                  : 'Indoor Seating'}
              </span>
              <button
                className="occupied-sheet-close"
                onClick={() => setSelectedOccupiedTable(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="occupied-sheet-body">
              <div className="occupied-sheet-avatar">
                <img
                  src="/tables-icon.png"
                  alt="Table Icon"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/Dining table.png';
                  }}
                />
              </div>
              <div className="occupied-sheet-info">
                <h3 className="occupied-sheet-title">
                  {formatTableNumber(selectedOccupiedTable.number)}
                </h3>
                <div className="occupied-sheet-status">
                  <span className="status-dot"></span>
                  <span>
                    {(selectedOccupiedTable.status || '').toLowerCase() === 'billing'
                      ? 'Billing in Progress'
                      : 'Dining in Progress'}
                  </span>
                </div>
              </div>
            </div>

            <div className="occupied-sheet-actions">
              <button
                className="btn-view-bill"
                onClick={() => handleViewBill(selectedOccupiedTable)}
              >
                View Bill
              </button>
              <button
                className="btn-view-order"
                onClick={() => handleViewOrder(selectedOccupiedTable)}
              >
                View Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Reserved Table Details Bottom Sheet (RESERVED STATE ONLY) */}
      {selectedReservedTable && (
        <div className="reserved-overlay" onClick={() => setSelectedReservedTable(null)}>
          <div className="reserved-details-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="reserved-sheet-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="reserved-title" style={{ fontSize: '11px', color: '#85807D', fontWeight: 400 }}>
                {(selectedReservedTable.section || '').toLowerCase().includes('out')
                  ? 'Outdoor Seating'
                  : 'Indoor Seating'}
              </span>
              <button
                className="reserved-close"
                style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E0DC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#77716D', fontSize: '12px', cursor: 'pointer' }}
                onClick={() => setSelectedReservedTable(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Table Information Section */}
            <div className="reserved-sheet-body" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div className="table-icon-wrapper" style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#F8F4F1', border: '1px solid #E5D9D2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img
                  src="/tables-icon.png"
                  alt="Table Icon"
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/Dining table.png';
                  }}
                />
              </div>
              <div className="reserved-sheet-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#171717', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Table {String(selectedReservedTable.number).replace(/^T/i, '')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="reserved-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7A9FD3', display: 'inline-block' }}></span>
                  <span className="reserved-info" style={{ color: '#85807D', fontSize: '9px', fontWeight: 400 }}>
                    Reserved by{' '}
                    {selectedReservedTable.active_reservation?.guest_name || guestName || 'Guest'}{' '}
                    ·{' '}
                    {formatArrivalTime(
                      selectedReservedTable.active_reservation?.arrival_time || arrivalTime || '7:30 PM'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Start Order & Cancel Reservation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '8px' }}>
              <button
                className="start-order-btn"
                style={{
                  width: '100%',
                  height: '28px',
                  background: '#350505',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '18px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={() => handleStartOrderFromReserved(selectedReservedTable)}
              >
                Start Order
              </button>
              <button
                className="cancel-reservation-btn"
                style={{
                  width: '100%',
                  height: '28px',
                  background: '#FFFFFF',
                  color: '#350505',
                  border: '1px solid #350505',
                  borderRadius: '18px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Available Table Bottom Sheet Modal (AVAILABLE STATE ONLY) */}
      {selectedAvailableTable && (
        <div className="table-modal-overlay" onClick={() => setSelectedAvailableTable(null)}>
          <div className="reserved-table-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="reserved-sheet-header">
              <span className="reserved-sheet-location">
                {(selectedAvailableTable.section || '').toLowerCase().includes('out')
                  ? 'Outdoor Seating'
                  : 'Indoor Seating'}
              </span>
              <button
                className="reserved-sheet-close"
                onClick={() => setSelectedAvailableTable(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="reserved-sheet-body">
              <div className="reserved-sheet-avatar">
                <img
                  src="/tables-icon.png"
                  alt="Table Icon"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/Dining table.png';
                  }}
                />
              </div>
              <div className="reserved-sheet-info">
                <h3 className="reserved-sheet-title">
                  Table {selectedAvailableTable.number}
                </h3>
                <div className="reserved-sheet-status">
                  <span className="status-dot-green"></span>
                  <span>Ready for service</span>
                </div>
              </div>
            </div>

            {!showReserveForm ? (
              <div className="reserved-sheet-actions" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  className="start-order-btn"
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '24px',
                    background: '#350505',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedTable(selectedAvailableTable);
                    setSelectedAvailableTable(null);
                    navigate('/pos');
                  }}
                >
                  Start Order
                </button>
                <button
                  className="reserve-this-table-btn"
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '24px',
                    background: '#FFFFFF',
                    color: '#350505',
                    border: '1.5px solid #350505',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowReserveForm(true)}
                >
                  Reserve this Table
                </button>
              </div>
            ) : (
              <>
                <div className="reservation-form-group" style={{ marginTop: '14px' }}>
                  <label className="reservation-label">Guest Name</label>
                  <input
                    type="text"
                    className="reservation-input"
                    placeholder="Enter guest name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />

                  <label className="reservation-label" style={{ marginTop: '12px' }}>
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    className="reservation-input"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                  />

                  {resError && <div className="reservation-error-msg">{resError}</div>}
                </div>

                <div className="reserved-sheet-actions" style={{ marginTop: '18px' }}>
                  <button
                    className="confirm-reservation-btn"
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '24px',
                      background: '#350505',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleConfirmReservation(selectedAvailableTable)}
                    disabled={isSubmittingRes}
                  >
                    {isSubmittingRes ? 'Confirming...' : 'Confirm Reservation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cancel Reservation Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="table-modal-overlay" style={{ zIndex: 10010 }}>
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              width: '85vw',
              maxWidth: '360px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              zIndex: 10011,
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#350505', marginBottom: '8px' }}>
              Cancel Reservation?
            </h3>
            <p style={{ fontSize: '14px', color: '#6F625C', marginBottom: '20px', lineHeight: 1.4 }}>
              Are you sure you want to cancel this reservation for Table {selectedReservedTable?.number}?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '22px',
                  border: '1px solid #350505',
                  background: '#FFFFFF',
                  color: '#350505',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Keep Reservation
              </button>
              <button
                onClick={handleConfirmCancelReservation}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '22px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Floating Toast */}
      {resSuccess && (
        <div className="order-sent-pill">
          <span>{resSuccess}</span>
        </div>
      )}
    </div>
  );
};
