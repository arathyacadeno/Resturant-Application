import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Receipt, 
  Settings 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="admin-portal-sidebar">
      {/* ── Top Brand Header ── */}
      <div className="admin-portal-brand">
        <div className="admin-portal-brand-logo">
          <img 
            src="/logo.png" 
            alt="T Clock" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/cart.png';
            }}
          />
        </div>
        <div className="admin-portal-brand-text">
          <h2 className="admin-portal-brand-title">T Clock</h2>
          <span className="admin-portal-brand-sub">ADMIN PORTAL</span>
        </div>
      </div>

      {/* ── Navigation Menu ── */}
      <nav className="admin-portal-nav">
        <ul className="admin-portal-nav-list">
          {/* Dashboard */}
          <li>
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutGrid size={21} strokeWidth={2.2} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Menu Catalogue */}
          <li>
            <NavLink 
              to="/admin/menu" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <img 
                    src={isActive ? "/sidebar2-active.png" : "/sidebar2.png"} 
                    alt="Menu Catalogue" 
                    className="admin-portal-nav-img"
                  />
                  <span>Menu Catalogue</span>
                </>
              )}
            </NavLink>
          </li>

          {/* Order History */}
          <li>
            <NavLink 
              to="/admin/orders" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <Receipt size={21} strokeWidth={1.8} />
              <span>Order History</span>
            </NavLink>
          </li>

          {/* Staffs */}
          <li>
            <NavLink 
              to="/admin/staffs" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="14" x="3" y="6" rx="2" />
                <path d="M9 2v4" />
                <path d="M15 2v4" />
                <circle cx="8" cy="13" r="2" />
                <path d="M13 11h4" />
                <path d="M13 15h3" />
              </svg>
              <span>Staffs</span>
            </NavLink>
          </li>

          {/* Kitchen Screen */}
          <li>
            <NavLink 
              to="/admin/kitchen" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 2 6 6-9 9-6-6Z" />
                <path d="M9 14l-4 4-2-2 4-4" />
                <path d="M3 21l3-3" />
              </svg>
              <span>Kitchen Screen</span>
            </NavLink>
          </li>

          {/* Settings */}
          <li>
            <NavLink 
              to="/admin/settings" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <Settings size={21} strokeWidth={1.8} />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* ── Bottom Logout Button ── */}
      <div className="admin-portal-sidebar-footer">
        <button 
          type="button"
          className="admin-portal-logout-btn" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
