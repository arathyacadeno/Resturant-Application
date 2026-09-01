import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Receipt, 
  UtensilsCrossed, 
  Users, 
  BarChart2, 
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
              <LayoutGrid size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Menu Catalogue */}
          <li>
            <NavLink 
              to="/admin/menu" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <UtensilsCrossed size={18} />
              <span>Menu Catalogue</span>
            </NavLink>
          </li>

          {/* Order History */}
          <li>
            <NavLink 
              to="/admin/orders" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <Receipt size={18} />
              <span>Order History</span>
            </NavLink>
          </li>

          {/* Staffs */}
          <li>
            <NavLink 
              to="/admin/staffs" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Staffs</span>
            </NavLink>
          </li>

          {/* Swiggy & Zomato */}
          <li>
            <NavLink 
              to="/admin/swiggy-zomato" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <BarChart2 size={18} />
              <span>Swiggy & Zomato</span>
            </NavLink>
          </li>

          {/* Settings */}
          <li>
            <NavLink 
              to="/admin/settings" 
              className={({ isActive }) => `admin-portal-nav-link ${isActive ? 'active' : ''}`}
            >
              <Settings size={18} />
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
