import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { tablesApi } from '../../api/tablesApi';

export const EditTableModal = ({ isOpen, table, onClose, onTableUpdated }) => {
  const [capacity, setCapacity] = useState(4);
  const [section, setSection] = useState('indoor');
  const [status, setStatus] = useState('available');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (table) {
      setCapacity(table.capacity || 4);
      setSection((table.section || 'indoor').toLowerCase());
      setStatus((table.status || 'available').toLowerCase());
      setError('');
    }
  }, [table]);

  if (!isOpen || !table) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await tablesApi.updateTable(table.id, {
        number: table.number,
        name: table.name || `Table ${table.number}`,
        capacity: parseInt(capacity, 10) || 4,
        section: section.toLowerCase(),
        status: status.toLowerCase(),
      });
      onClose();
      if (onTableUpdated) onTableUpdated();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to update table details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Edit Table {table.number}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="admin-modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-group">
            <label>Seating Capacity</label>
            <input
              type="number"
              min="1"
              max="20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Section Area</label>
            <select value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="terrace">Terrace</option>
              <option value="private">Private Room</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label>Table Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="billing">Billing</option>
            </select>
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTableModal;
