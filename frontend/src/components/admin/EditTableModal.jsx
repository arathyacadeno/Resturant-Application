import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { tablesApi } from '../../api/tablesApi';

/**
 * EditTableModal
 *
 * Exact replication of the reference design:
 * - Centered compact white modal with rounded corners (#FFFFFF, border-radius: 20px)
 * - Blurred and dimmed dashboard background
 * - Top-right close icon (X)
 * - Centered dynamic title (e.g. "Edit Table 2")
 * - Form Fields:
 *    1. Table Name: Text input (pre-filled e.g. "T2")
 *    2. Seat Capacity: Dropdown select (pre-selected e.g. "4")
 *    3. Dining Area: Dropdown select (pre-selected e.g. "Indoor")
 * - Full-width dark maroon Save button (#230704 / #2A0808)
 */
export const EditTableModal = ({ isOpen, table, onClose, onTableUpdated }) => {
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [diningArea, setDiningArea] = useState('Indoor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (table) {
      const numStr = String(table.number || '2').replace(/^Table\s*/i, '').trim();
      const formattedNum = numStr.toUpperCase().startsWith('T')
        ? numStr.toUpperCase()
        : `T${numStr}`;
      setTableName(table.name || formattedNum);
      setCapacity(table.capacity || 4);

      const sec = table.section
        ? table.section.charAt(0).toUpperCase() + table.section.slice(1).toLowerCase()
        : 'Indoor';
      setDiningArea(sec);
      setError('');
    }
  }, [table]);

  if (!isOpen || !table) return null;

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
      <div className="admin-edit-modal-card" onClick={(e) => e.stopPropagation()}>
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

          {/* 2. Seat Capacity */}
          <div className="admin-edit-form-group">
            <label className="admin-edit-form-label">Seat Capacity</label>
            <div className="admin-edit-select-wrapper">
              <select
                className="admin-edit-form-select"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={12}>12</option>
              </select>
              <ChevronDown size={16} color="#4B5563" className="admin-edit-select-chevron" />
            </div>
          </div>

          {/* 3. Dining Area */}
          <div className="admin-edit-form-group">
            <label className="admin-edit-form-label">Dining Area</label>
            <div className="admin-edit-select-wrapper">
              <select
                className="admin-edit-form-select"
                value={diningArea}
                onChange={(e) => setDiningArea(e.target.value)}
              >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Terrace">Terrace</option>
                <option value="Private Room">Private Room</option>
              </select>
              <ChevronDown size={16} color="#4B5563" className="admin-edit-select-chevron" />
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
