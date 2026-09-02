import React, { useState, useEffect } from 'react';
import { menuApi } from '../../api/menuApi';
import { X } from 'lucide-react';

/**
 * EditCategoryModal
 * Modal for editing existing menu category name/description
 */
export const EditCategoryModal = ({ isOpen, category, onClose, onCategoryUpdated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setError('');
    }
  }, [category, isOpen]);

  if (!isOpen || !category) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const updatedCategory = await menuApi.updateCategory(category.id, {
        name: name.trim(),
        description: description.trim(),
      });
      if (onCategoryUpdated) onCategoryUpdated(updatedCategory);
      onClose();
    } catch (err) {
      console.error('Failed to update category:', err);
      setError(
        err?.response?.data?.name?.[0] ||
        err?.response?.data?.detail ||
        'Failed to update category'
      );
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
            Edit Category
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
            Update category name and details
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
