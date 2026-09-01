import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../api/analyticsApi';
import { 
  DollarSign, 
  ShoppingBag, 
  Grid, 
  TrendingUp, 
  Utensils, 
  RefreshCw 
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, chartRes, itemsRes] = await Promise.allSettled([
        analyticsApi.getDashboardSummary(),
        analyticsApi.getRevenueChart(7),
        analyticsApi.getTopItems(),
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (chartRes.status === 'fulfilled') setRevenueChart(chartRes.value);
      if (itemsRes.status === 'fulfilled') setTopItems(itemsRes.value);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'staff') {
      loadData();
    }
  }, [user?.role]);

  if (user?.role === 'staff') {
    return <Navigate to="/tables" replace />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Restaurant Dashboard</h1>
          <p>Real-time metrics & performance overview for T-Clock</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>TODAY'S REVENUE</span>
            <div className="badge badge-amber" style={{ padding: '0.4rem' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--accent-amber)' }}>
            ₹{summary?.today_revenue ? parseFloat(summary.today_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {summary?.today_bills_count || 0} completed bills today
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>ACTIVE ORDERS</span>
            <div className="badge badge-blue" style={{ padding: '0.4rem' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem' }}>{summary?.active_orders_count || 0}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--status-info)' }}>In kitchen or serving</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>TABLE OCCUPANCY</span>
            <div className="badge badge-green" style={{ padding: '0.4rem' }}>
              <Grid size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem' }}>
            {summary?.occupied_tables || 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {summary?.total_tables || 0}</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--status-success)' }}>
            {summary?.total_tables ? Math.round(((summary.occupied_tables || 0) / summary.total_tables) * 100) : 0}% Occupied
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>MONTHLY REVENUE</span>
            <div className="badge badge-purple" style={{ padding: '0.4rem' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem' }}>
            ₹{summary?.month_revenue ? parseFloat(summary.month_revenue).toLocaleString('en-IN') : '0'}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This month's total sales</span>
        </div>
      </div>

      {/* Section Grid: Sales Trend & Top Dishes */}
      <div className="grid-2">
        {/* Revenue Visualizer */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--accent-amber)" />
            <span>Weekly Revenue Trend</span>
          </h3>

          {revenueChart && revenueChart.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '220px', paddingTop: '2rem' }}>
              {revenueChart.map((day, idx) => {
                const maxRev = Math.max(...revenueChart.map(d => d.total || 0), 100);
                const heightPercent = Math.max(10, Math.round(((day.total || 0) / maxRev) * 100));
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 600 }}>₹{day.total || 0}</span>
                    <div style={{ 
                      width: '100%', 
                      height: `${heightPercent}%`, 
                      background: 'linear-gradient(to top, var(--accent-amber-hover), var(--accent-amber))',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      boxShadow: 'var(--shadow-glow)'
                    }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{day.date?.slice(5) || day.day}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No recent revenue data available
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils size={20} color="var(--accent-amber)" />
            <span>Top Selling Dishes</span>
          </h3>

          {topItems && topItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topItems.slice(0, 5).map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-amber" style={{ width: '24px', height: '24px', borderRadius: '50%', padding: 0, justifyContent: 'center' }}>
                      {index + 1}
                    </span>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{item.menu_item__name || item.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.total_sold} orders sold
                      </span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>
                    ₹{item.total_revenue ? parseFloat(item.total_revenue).toFixed(2) : '0.00'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No top items recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
