import React, { useState } from 'react';
import { menuApi } from '../../api/menuApi';
import { X } from 'lucide-react';

/**
 * AddCategoryModal
 * Clean modal for adding new menu categories to backend
 */
export const AddCategoryModal = ({ isOpen, onClose, onCategoryCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const newCategory = await menuApi.createCategory({
        name: name.trim(),
        description: description.trim(),
      });
      if (onCategoryCreated) onCategoryCreated(newCategory);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Failed to create category:', err);
      setError(err?.response?.data?.name?.[0] || err?.response?.data?.detail || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-profile-modal-overlay" onClick={onClose}>
      <div
        className="admin-profile-modal-card"
        style={{ maxWidth: '420px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          className="admin-profile-modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} color="#4B5563" />
        </button>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#111827' }}>
            Add New Category
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
            Create a menu category to organize your dishes
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2',
            color: '#DC2626',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Starters, Main Course, Desserts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="admin-profile-input"
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Description (Optional)
            </label>
            <textarea
              placeholder="Brief description of the category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-profile-input"
              style={{ minHeight: '70px', padding: '10px 14px', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="admin-profile-save-btn"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
