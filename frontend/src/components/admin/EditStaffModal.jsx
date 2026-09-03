import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { authApi } from '../../api/authApi';

export const EditStaffModal = ({ isOpen, staff, onClose, onStaffUpdated }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    username: '',
    password: '',
    role: 'staff',
    role_title: 'Staff 1',
    email: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      // Determine role title
      let initialRoleTitle = 'Staff 1';
      if (staff.custom_role_data?.name) {
        initialRoleTitle = staff.custom_role_data.name;
      } else {
        const r = (staff.role || '').toLowerCase();
        if (r === 'admin') initialRoleTitle = 'Admin';
        else if (r === 'kitchen') initialRoleTitle = 'Chef';
        else if (r === 'manager') initialRoleTitle = 'Manager';
        else if (r === 'cashier') initialRoleTitle = 'Cashier';
        else if (r === 'staff') initialRoleTitle = 'Staff 1';
      }

      setFormData({
        first_name: staff.first_name || staff.username || '',
        username: staff.username || '',
        password: staff.raw_password || '',
        role: staff.role || 'staff',
        role_title: initialRoleTitle,
        email: staff.email || '',
        phone: staff.phone || '',
      });
      setShowPassword(false);
      setError('');
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

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

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        first_name: formData.first_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await authApi.updateStaff(staff.id, payload);

      if (onStaffUpdated) {
        onStaffUpdated();
      }
      onClose();
    } catch (err) {
      console.error('Failed to update staff:', err);
      const msg = err.response?.data?.username?.[0] || 
                  err.response?.data?.detail || 
                  err.response?.data?.error || 
                  'Failed to update staff member.';
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
            Edit Staff
          </h3>
          <p className="admin-staff-modal-subtitle">
            Update this team members details
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
                placeholder="Sameesha"
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
                placeholder="sameesha"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="admin-staff-modal-input"
              />
            </div>
          </div>

          {/* Row 2: Password with Eye Toggle (Real Password) */}
          <div>
            <label className="admin-staff-modal-label">
              Password
            </label>
            <div className="admin-staff-modal-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="admin-staff-modal-input"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="admin-staff-modal-eye-btn"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
                placeholder="sam@gmail.com"
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
                placeholder="8547189033"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="admin-staff-modal-input"
              />
            </div>
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

export default EditStaffModal;
