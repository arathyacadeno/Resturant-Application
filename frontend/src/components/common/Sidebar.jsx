import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Grid, 
  ChefHat, 
  UtensilsCrossed, 
  Receipt, 
  Settings, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';
  const isKitchen = user?.role === 'kitchen' || user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="brand-header">
        <img 
          src="/logo.png" 
          alt="T-Clock Logo" 
          style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '50%' }} 
        />
        <div>
          <h2 className="brand-title">T-CLOCK</h2>
          <span className="brand-subtitle">RESTO CAFE</span>
        </div>
      </div>

      <ul className="nav-list">
        {/* Admin Dashboard */}
        {isAdmin && (
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
        )}

        {/* Staff Dashboard Items: Tables, Orders (POS), Billing */}
        {isStaff && (
          <li>
            <NavLink to="/tables" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Grid size={20} />
              <span>Tables</span>
            </NavLink>
          </li>
        )}

        {isStaff && (
          <li>
            <NavLink to="/pos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShoppingBag size={20} />
              <span>Orders</span>
            </NavLink>
          </li>
        )}

        {isStaff && (
          <li>
            <NavLink to="/billing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Receipt size={20} />
              <span>Billing</span>
            </NavLink>
          </li>
        )}

        {/* Kitchen Display */}
        {isKitchen && (
          <li>
            <NavLink to="/kitchen" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ChefHat size={20} />
              <span>Kitchen Display</span>
            </NavLink>
          </li>
        )}

        {/* Admin Only Items: Menu Editor & Settings */}
        {isAdmin && (
          <li>
            <NavLink to="/menu" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <UtensilsCrossed size={20} />
              <span>Menu Editor</span>
            </NavLink>
          </li>
        )}

        {isAdmin && (
          <li>
            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </li>
        )}
      </ul>

      <div className="sidebar-user">
        <div className="user-info">
          <div className="avatar-circle">
            {user?.username ? user.username[0].toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <h4>{user?.first_name || user?.username || 'Staff'}</h4>
            <span>{user?.role || 'Staff'}</span>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
