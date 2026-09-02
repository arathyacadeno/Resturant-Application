import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Plus, Check } from 'lucide-react';
import { tablesApi } from '../../api/tablesApi';

/**
 * EditTableModal
 *
 * Exact replication of the reference design:
 * - Centered compact white modal with rounded corners (#FFFFFF, border-radius: 20px)
 * - Blurred and dimmed dashboard background
 * - Top-right close icon (X)
 * - Centered dynamic title (e.g. "Edit Table 2")
 * - Form Fields with custom dark maroon dropdowns:
 *    1. Table Name: Text input (pre-filled e.g. "T2")
 *    2. Seat Capacity: Custom dropdown with capacity options + "+ Add new seats"
 *    3. Dining Area: Custom dropdown with area options + "+ Add new dining area"
 * - Full-width dark maroon Save button (#230704 / #2A0808)
 */
export const EditTableModal = ({ isOpen, table, onClose, onTableUpdated }) => {
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [diningArea, setDiningArea] = useState('Indoor');
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

  useEffect(() => {
    if (table) {
      const numStr = String(table.number || '2').replace(/^Table\s*/i, '').trim();
      const formattedNum = numStr.toUpperCase().startsWith('T')
        ? numStr.toUpperCase()
        : `T${numStr}`;
      setTableName(table.name || formattedNum);

      const capStr = String(table.capacity || 4);
      setCapacity(capStr);
      if (!capacityOptions.includes(capStr)) {
        setCapacityOptions((prev) => [...prev, capStr].sort((a, b) => parseInt(a, 10) - parseInt(b, 10)));
      }

      const sec = table.section
        ? table.section.charAt(0).toUpperCase() + table.section.slice(1).toLowerCase()
        : 'Indoor';
      setDiningArea(sec);
      if (!areaOptions.includes(sec)) {
        setAreaOptions((prev) => [...prev, sec]);
      }

      setError('');
      setOpenDropdown(null);
    }
  }, [table]);

  if (!isOpen || !table) return null;

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

  // Title formatting: "Edit Table 2"
  const cleanNumber =
    String(table.number || '2').replace(/\D/g, '') ||
    String(table.number || '2').replace(/^Table\s*/i, '');
  const modalTitle = `Edit Table ${cleanNumber}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const updated = await tablesApi.updateTable(table.id, {
        number: tableName.trim(),
        name: tableName.trim(),
        capacity: parseInt(capacity, 10) || 4,
        section: diningArea.toLowerCase(),
      });
      onClose();
      if (onTableUpdated) {
        onTableUpdated(
          updated || {
            ...table,
            number: tableName.trim(),
            name: tableName.trim(),
            capacity: parseInt(capacity, 10) || 4,
            section: diningArea.toLowerCase(),
          }
        );
      }
    } catch (err) {
      console.error('Failed to update table details:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to update table details. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-edit-modal-overlay" onClick={onClose}>
      <div className="admin-edit-modal-card" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {/* Top-right close button */}
        <button
          type="button"
          className="admin-edit-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={17} color="#8E8E93" strokeWidth={2.2} />
        </button>

        {/* Centered Dynamic Title */}
        <h2 className="admin-edit-modal-title">{modalTitle}</h2>

        {error && <div className="admin-edit-modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-edit-modal-form">
          {/* 1. Table Name */}
          <div className="admin-edit-form-group">
            <label className="admin-edit-form-label">Table Name</label>
            <input
              type="text"
              className="admin-edit-form-input"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g. T2"
              required
            />
          </div>

          {/* 2. Seat Capacity (Custom Dropdown) */}
          <div className="admin-edit-form-group">
            <label className="admin-edit-form-label">Seat Capacity</label>
            <div className="admin-custom-select-container">
              {/* Trigger */}
              <div
                className={`admin-custom-select-trigger ${openDropdown === 'capacity' ? 'is-active' : ''}`}
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
                        className={`admin-custom-dropdown-option ${String(capacity) === String(opt) ? 'selected' : ''}`}
                        onClick={() => {
                          setCapacity(opt);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{opt} Seats</span>
                        {String(capacity) === String(opt) && <Check size={14} color="#FFFFFF" />}
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
          <div className="admin-edit-form-group">
            <label className="admin-edit-form-label">Dining Area</label>
            <div className="admin-custom-select-container">
              {/* Trigger */}
              <div
                className={`admin-custom-select-trigger ${openDropdown === 'area' ? 'is-active' : ''}`}
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

          {/* Full-width Save Button */}
          <button
            type="submit"
            className="admin-edit-save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTableModal;
