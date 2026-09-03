import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { authApi } from '../../api/authApi';

export const AddStaffModal = ({ isOpen, onClose, onStaffCreated }) => {
  // Format today's date (e.g. "19 Aug 2026")
  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const [formData, setFormData] = useState({
    first_name: '',
    username: '',
    password: '',
    role: 'staff',
    role_title: 'Staff 1',
    email: '',
    phone: '',
    joining_date: getTodayFormatted(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRoleChange = (selectedTitle) => {
    let baseRole = 'staff';
    if (selectedTitle === 'Admin') baseRole = 'admin';
    else if (selectedTitle === 'Chef') baseRole = 'kitchen';
    else if (selectedTitle === 'Manager') baseRole = 'admin';
    else if (selectedTitle === 'Cashier') baseRole = 'staff';

    setFormData({
      ...formData,
      role_title: selectedTitle,
      role: baseRole,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Username and Password are required');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.createStaff({
        username: formData.username.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      });

      if (onStaffCreated) {
        onStaffCreated();
      }
      onClose();
    } catch (err) {
      console.error('Failed to create staff:', err);
      const msg = err.response?.data?.username?.[0] || 
                  err.response?.data?.detail || 
                  err.response?.data?.error || 
                  'Failed to create staff member.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-staff-modal-overlay" onClick={onClose}>
      <div 
        className="admin-staff-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Circular Close Button */}
        <button 
          type="button" 
          className="admin-staff-modal-close"
          onClick={onClose}
          title="Close"
        >
          <X size={14} color="#78716C" strokeWidth={2.2} />
        </button>

        {/* Centered Header */}
        <div className="admin-staff-modal-header">
          <h3 className="admin-staff-modal-title">
            Add Staff
          </h3>
          <p className="admin-staff-modal-subtitle">
            Add a new team member and assign a role
          </p>
        </div>

        {error && (
          <div className="admin-staff-modal-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-staff-modal-form">
          {/* Row 1: Full Name & Username */}
          <div className="admin-staff-modal-grid-2">
            <div>
              <label className="admin-staff-modal-label">
                Full Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="admin-staff-modal-input"
              />
            </div>

            <div>
              <label className="admin-staff-modal-label">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="admin-staff-modal-input"
              />
            </div>
          </div>

          {/* Row 2: Password */}
          <div>
            <label className="admin-staff-modal-label">
              Password
            </label>
            <div className="admin-staff-modal-input-wrap">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="admin-staff-modal-input"
              />
            </div>
          </div>

          {/* Row 3: Role Dropdown */}
          <div>
            <label className="admin-staff-modal-label">
              Role
            </label>
            <div className="admin-staff-modal-input-wrap">
              <select
                value={formData.role_title}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="admin-staff-modal-select"
              >
                <option value="Staff 1">Staff 1</option>
                <option value="Staff 2">Staff 2</option>
                <option value="Chef">Chef</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Admin">Admin</option>
              </select>
              <ChevronDown 
                size={15} 
                className="admin-staff-modal-chevron"
              />
            </div>
          </div>

          {/* Row 4: Email & Phone */}
          <div className="admin-staff-modal-grid-2">
            <div>
              <label className="admin-staff-modal-label">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="admin-staff-modal-input"
              />
            </div>

            <div>
              <label className="admin-staff-modal-label">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="admin-staff-modal-input"
              />
            </div>
          </div>

          {/* Row 5: Joining Date */}
          <div>
            <label className="admin-staff-modal-label">
              Joining Date
            </label>
            <input
              type="text"
              value={formData.joining_date}
              onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
              className="admin-staff-modal-input"
            />
          </div>

          {/* Bottom Save Button */}
          <button
            type="submit"
            disabled={submitting}
            className="admin-staff-modal-save-btn"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
