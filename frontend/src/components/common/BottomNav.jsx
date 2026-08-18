import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Grid, Receipt, UtensilsCrossed } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const location = useLocation();
  const { cartItems } = useOrder();
  const { user } = useAuth();

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/tables"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Grid size={20} />
        <span className="bottom-nav-label">Tables</span>
      </NavLink>

      <NavLink
        to="/pos"
        className={({ isActive }) => `bottom-nav-item ${isActive || location.pathname === '/' ? 'active' : ''}`}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={20} />
          {totalCartCount > 0 && (
            <span className="cart-badge-count">{totalCartCount}</span>
          )}
        </div>
        <span className="bottom-nav-label">Orders</span>
      </NavLink>

      <NavLink
        to="/billing"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Receipt size={20} />
        <span className="bottom-nav-label">Billing</span>
      </NavLink>

      {isAdmin && (
        <NavLink
          to="/menu"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <UtensilsCrossed size={20} />
          <span className="bottom-nav-label">Menu</span>
        </NavLink>
      )}
    </nav>
  );
};


