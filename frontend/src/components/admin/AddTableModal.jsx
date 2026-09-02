import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Plus, Check } from 'lucide-react';
import { tablesApi } from '../../api/tablesApi';

/**
 * AddTableModal
 *
 * Exact replication of the reference design with custom Dark Maroon dropdowns:
 * - Centered compact white modal with large rounded corners (#FFFFFF, border-radius: 24px)
 * - Blurred and dimmed dashboard background
 * - Top-right close icon (X)
 * - Centered Header:
 *    - Title: "Add New Table"
 *    - Subtitle: "Configure your dining space"
 * - Custom Dark Maroon Dropdowns with absolute positioning:
 *    - Seat Capacity: opens dark dropdown with capacity options + "+ Add new seats"
 *    - Dining Area: opens dark dropdown with area options + "+ Add new dining area"
 * - Full-width dark maroon "Add Table" button (#230704 / #2A0808)
 */
export const AddTableModal = ({ isOpen, onClose, onTableCreated }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [diningArea, setDiningArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null); // 'capacity' | 'area' | null
  const [capacityOptions, setCapacityOptions] = useState(['2', '4', '6', '8', '10', '12']);
  const [areaOptions, setAreaOptions] = useState(['Indoor', 'Outdoor', 'Terrace', 'Private Room']);

  // Inline add state
  const [showAddCustomCapacity, setShowAddCustomCapacity] = useState(false);
  const [customCapacityInput, setCustomCapacityInput] = useState('');
  const [showAddCustomArea, setShowAddCustomArea] = useState(false);
  const [customAreaInput, setCustomAreaInput] = useState('');

  const modalRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddNewCapacity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const val = customCapacityInput.trim();
    if (val && !isNaN(val) && parseInt(val, 10) > 0) {
      if (!capacityOptions.includes(val)) {
        setCapacityOptions((prev) => [...prev, val].sort((a, b) => parseInt(a, 10) - parseInt(b, 10)));
      }
      setCapacity(val);
      setCustomCapacityInput('');
      setShowAddCustomCapacity(false);
      setOpenDropdown(null);
    }
  };

  const handleAddNewArea = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const val = customAreaInput.trim();
    if (val) {
      const formatted = val.charAt(0).toUpperCase() + val.slice(1);
      if (!areaOptions.includes(formatted)) {
        setAreaOptions((prev) => [...prev, formatted]);
      }
      setDiningArea(formatted);
      setCustomAreaInput('');
      setShowAddCustomArea(false);
      setOpenDropdown(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanNum = String(tableNumber || '').trim().replace(/^Table\s*/i, '').replace(/^T\s*-?\s*/i, '').trim();
    if (!cleanNum) {
      setError('Please enter a valid table number (e.g. 13 or T-13).');
      return;
    }

    if (!capacity) {
      setError('Please select a seat capacity.');
      return;
    }

    if (!diningArea) {
      setError('Please select a dining area.');
      return;
    }

    const formattedNum = `T${cleanNum}`;

    setIsSubmitting(true);
    try {
      const newTable = await tablesApi.createTable({
        number: formattedNum,
        name: `Table ${cleanNum}`,
        capacity: parseInt(capacity, 10),
        section: diningArea.toLowerCase(),
        status: 'available',
      });

      // Reset form
      setTableNumber('');
      setCapacity('');
      setDiningArea('');
      setError('');
      setOpenDropdown(null);
      onClose();

      if (onTableCreated) {
        onTableCreated(newTable);
      }
    } catch (err) {
      console.error('Failed to create table:', err);
      const serverErr =
        err.response?.data?.number?.[0] ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error;

      if (serverErr && (serverErr.includes('already exists') || serverErr.includes('unique'))) {
        setError(`Table ${cleanNum} already exists. Please enter a different number.`);
      } else {
        setError(serverErr || 'Failed to create table. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-add-modal-overlay" onClick={onClose}>
      <div
        className="admin-add-modal-card"
        ref={modalRef}
        onClick={(e) => {
          e.stopPropagation();
          // Clicking anywhere inside modal card that's not a dropdown trigger/menu closes dropdown
        }}
      >
        {/* Top-right close button */}
        <button
          type="button"
          className="admin-add-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={17} color="#8E8E93" strokeWidth={2.2} />
        </button>

        {/* Centered Title & Subtitle */}
        <div className="admin-add-modal-header">
          <h2 className="admin-add-modal-title">Add New Table</h2>
          <p className="admin-add-modal-subtitle">Configure your dining space</p>
        </div>

        {error && <div className="admin-add-modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-add-modal-form">
          {/* 1. Table Number */}
          <div className="admin-add-form-group">
            <label className="admin-add-form-label">Table Number</label>
            <input
              type="text"
              className="admin-add-form-input"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 13 or T-13"
              required
              autoFocus
            />
          </div>

          {/* 2. Seat Capacity (Custom Dropdown) */}
          <div className="admin-add-form-group">
            <label className="admin-add-form-label">Seat Capacity</label>
            <div className="admin-custom-select-container">
              {/* Trigger */}
              <div
                className={`admin-custom-select-trigger ${openDropdown === 'capacity' ? 'is-active' : ''} ${!capacity ? 'is-placeholder' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown((prev) => (prev === 'capacity' ? null : 'capacity'));
                  setShowAddCustomCapacity(false);
                }}
              >
                <span>{capacity ? `${capacity} Seats` : 'Select seat capacity'}</span>
                <ChevronDown
                  size={16}
                  color={openDropdown === 'capacity' ? '#230704' : '#4B5563'}
                  className={`admin-custom-select-arrow ${openDropdown === 'capacity' ? 'is-open' : ''}`}
                />
              </div>

              {/* Dropdown Menu */}
              {openDropdown === 'capacity' && (
                <div className="admin-custom-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="admin-custom-dropdown-list">
                    {capacityOptions.map((opt) => (
                      <div
                        key={opt}
                        className={`admin-custom-dropdown-option ${capacity === opt ? 'selected' : ''}`}
                        onClick={() => {
                          setCapacity(opt);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{opt} Seats</span>
                        {capacity === opt && <Check size={14} color="#FFFFFF" />}
                      </div>
                    ))}
                  </div>

                  {/* Add New Seats Option */}
                  {showAddCustomCapacity ? (
                    <div className="admin-custom-dropdown-inline-add">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="Seats (e.g. 14)"
                        value={customCapacityInput}
                        onChange={(e) => setCustomCapacityInput(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNewCapacity(e);
                        }}
                      />
                      <button type="button" onClick={handleAddNewCapacity}>
                        Add
                      </button>
                    </div>
                  ) : (
                    <div
                      className="admin-custom-dropdown-add-btn"
                      onClick={() => setShowAddCustomCapacity(true)}
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Add new seats</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Dining Area (Custom Dropdown) */}
          <div className="admin-add-form-group">
            <label className="admin-add-form-label">Dining Area</label>
            <div className="admin-custom-select-container">
              {/* Trigger */}
              <div
                className={`admin-custom-select-trigger ${openDropdown === 'area' ? 'is-active' : ''} ${!diningArea ? 'is-placeholder' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown((prev) => (prev === 'area' ? null : 'area'));
                  setShowAddCustomArea(false);
                }}
              >
                <span>{diningArea || 'Select dining area'}</span>
                <ChevronDown
                  size={16}
                  color={openDropdown === 'area' ? '#230704' : '#4B5563'}
                  className={`admin-custom-select-arrow ${openDropdown === 'area' ? 'is-open' : ''}`}
                />
              </div>

              {/* Dropdown Menu */}
              {openDropdown === 'area' && (
                <div className="admin-custom-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="admin-custom-dropdown-list">
                    {areaOptions.map((opt) => (
                      <div
                        key={opt}
                        className={`admin-custom-dropdown-option ${diningArea === opt ? 'selected' : ''}`}
                        onClick={() => {
                          setDiningArea(opt);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{opt}</span>
                        {diningArea === opt && <Check size={14} color="#FFFFFF" />}
                      </div>
                    ))}
                  </div>

                  {/* Add New Area Option */}
                  {showAddCustomArea ? (
                    <div className="admin-custom-dropdown-inline-add">
                      <input
                        type="text"
                        placeholder="Area name (e.g. Garden)"
                        value={customAreaInput}
                        onChange={(e) => setCustomAreaInput(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNewArea(e);
                        }}
                      />
                      <button type="button" onClick={handleAddNewArea}>
                        Add
                      </button>
                    </div>
                  ) : (
                    <div
                      className="admin-custom-dropdown-add-btn"
                      onClick={() => setShowAddCustomArea(true)}
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Add new dining area</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Full-width Add Table Button */}
          <button
            type="submit"
            className="admin-add-save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Table'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTableModal;
