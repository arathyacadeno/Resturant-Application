import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#FCE8D5',
        color: '#350707'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 700, backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            Loading T-Clock Resto System...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1, width: '100%' }}>
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};


