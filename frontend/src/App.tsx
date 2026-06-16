import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ERPDashboard } from './pages/ERPDashboard';
import { CRMDashboard } from './pages/CRMDashboard';
import { WMSDashboard } from './pages/WMSDashboard';
import { CloudDashboard } from './pages/CloudDashboard';
import { Products } from './pages/Products';
import { Suppliers } from './pages/Suppliers';
import { Customers } from './pages/Customers';
import { Leads } from './pages/Leads';
import { Orders } from './pages/Orders';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { WarehouseMovements } from './pages/WarehouseMovements';
import { Invoices } from './pages/Invoices';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { AccessDenied } from './pages/AccessDenied';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans text-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-success border-t-transparent rounded-full animate-spin" />
          <p className="font-bold tracking-wider opacity-90 animate-pulse">TIZIM YUKLANMOQDA (REMODULE ERP)...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/erp" element={<ProtectedRoute><ERPDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/crm" element={<ProtectedRoute><CRMDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/wms" element={<ProtectedRoute><WMSDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/cloud" element={<ProtectedRoute><CloudDashboard /></ProtectedRoute>} />
      
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
      
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
      
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      
      <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/movements" element={<ProtectedRoute><WarehouseMovements /></ProtectedRoute>} />
      
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Redirects & Errors */}
      <Route path="/access-denied" element={<ProtectedRoute><AccessDenied /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
    </Routes>
  );
};
