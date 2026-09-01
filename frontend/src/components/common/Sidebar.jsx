import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Receipt, 
  UtensilsCrossed, 
  Users, 
  BarChart2, 
  Settings, 
  LogOut,
  ShoppingBag,
  Grid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin' || !user?.role;
  const isStaff = user?.role === 'staff' || user?.role === 'admin';
  const isKitchen = user?.role === 'kitchen' || user?.role === 'admin';

  return (
    <aside className="admin-sidebar">
      {/* ── Brand Header ── */}
      <div className="admin-brand-header">
        <div className="admin-brand-logo-wrap">
          <img 
            src="/logo.png" 
            alt="T Clock" 
            className="admin-brand-logo-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/cart.png';
            }}
          />
        </div>
        <div className="admin-brand-text">
          <h2 className="admin-brand-title">T Clock</h2>
          <span className="admin-brand-subtitle">ADMIN PORTAL</span>
        </div>
      </div>

      {/* ── Nav Links ── */}
      <nav className="admin-nav-menu">
        <ul className="admin-nav-list">
          {/* Dashboard */}
          <li>
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <LayoutGrid size={18} className="admin-nav-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Order History */}
          <li>
            <NavLink 
              to="/billing" 
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Receipt size={18} className="admin-nav-icon" />
              <span>Order History</span>
            </NavLink>
          </li>

          {/* Menu Catalogue */}
          <li>
            <NavLink 
              to="/menu" 
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <UtensilsCrossed size={18} className="admin-nav-icon" />
              <span>Menu Catalogue</span>
            </NavLink>
          </li>

          {/* Staffs */}
          <li>
            <NavLink 
              to="/settings?tab=staffs" 
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Users size={18} className="admin-nav-icon" />
              <span>Staffs</span>
            </NavLink>
          </li>

          {/* Swiggy & Zomato */}
          <li>
            <NavLink 
              to="/pos" 
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <BarChart2 size={18} className="admin-nav-icon" />
              <span>Swiggy & Zomato</span>
            </NavLink>
          </li>

          {/* Settings */}
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Settings size={18} className="admin-nav-icon" />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* ── Fixed Bottom Logout Button ── */}
      <div className="admin-sidebar-footer">
        <button 
          type="button"
          className="admin-logout-btn" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
