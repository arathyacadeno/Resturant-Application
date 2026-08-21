import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Grid, Receipt, QrCode } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

export const BottomNav = () => {
  const location = useLocation();
  const { cartItems } = useOrder();
  const currentPath = location.pathname;

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/tables"
        className={`bottom-nav-item ${currentPath === '/tables' ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <img
            src="/tables-icon.png"
            alt="Tables"
            className="bottom-nav-icon-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/Dining table.png';
            }}
          />
        </div>
        <span className="bottom-nav-label">Tables</span>
      </NavLink>

      <NavLink
        to="/pos"
        className={`bottom-nav-item ${currentPath === '/pos' || currentPath === '/' ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <ShoppingBag size={20} />
          {totalCartCount > 0 && (
            <span className="cart-badge-count">{totalCartCount}</span>
          )}
        </div>
        <span className="bottom-nav-label">Orders</span>
      </NavLink>

      <NavLink
        to="/billing"
        className={`bottom-nav-item ${currentPath === '/billing' ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <Receipt size={20} />
        </div>
        <span className="bottom-nav-label">Billing</span>
      </NavLink>

      <NavLink
        to="/menu"
        className={`bottom-nav-item ${currentPath === '/menu' ? 'active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <QrCode size={20} />
        </div>
        <span className="bottom-nav-label">QR Code</span>
      </NavLink>
    </nav>
  );
};




