import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { ProtectedLayout } from './components/common/ProtectedLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { POSPage } from './pages/POSPage';
import { TablesPage } from './pages/TablesPage';
import { KitchenPage } from './pages/KitchenPage';
import { MenuPage } from './pages/MenuPage';
import { BillingPage } from './pages/BillingPage';
import { QRCodePage } from './pages/QRCodePage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <OrderProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/kitchen" element={<KitchenPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/qr" element={<QRCodePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </OrderProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
