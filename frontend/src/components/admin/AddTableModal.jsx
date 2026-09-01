import React, { useState } from 'react';
import { X } from 'lucide-react';
import { tablesApi } from '../../api/tablesApi';

export const AddTableModal = ({ isOpen, onClose, onTableCreated }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [section, setSection] = useState('indoor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanNum = String(tableNumber || '').trim().replace(/^Table\s*/i, '').replace(/^T\s*-?\s*/i, '').trim();
    if (!cleanNum) {
      setError('Please enter a valid table number');
      return;
    }
    const formattedNum = `T${cleanNum}`;

    setIsSubmitting(true);
    try {
      await tablesApi.createTable({
        number: formattedNum,
        name: `Table ${cleanNum}`,
        capacity: parseInt(capacity, 10) || 4,
        section: section.toLowerCase(),
      });
      setTableNumber('');
      setCapacity(4);
      setSection('indoor');
      onClose();
      if (onTableCreated) onTableCreated();
    } catch (err) {
      setError(
        err.response?.data?.number?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to create table. Table number might already exist.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Add New Dining Table</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="admin-modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-group">
            <label>Table Number</label>
            <input
              type="text"
              placeholder="e.g. 11 or T11"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              autoFocus
            />
          </div>

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
              {isSubmitting ? 'Creating...' : '+ Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTableModal;
