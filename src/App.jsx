import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './pages/Login';
import Sidebar from './components/common/Sidebar';
import TopBar from './components/common/TopBar';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SeasonManagement from './pages/admin/SeasonManagement';
import PricingConfig from './pages/admin/PricingConfig';
import FarmerRegistry from './pages/admin/FarmerRegistry';
import LotOverview from './pages/admin/LotOverview';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';

// Receptionist Pages
import DeliveryEntry from './pages/receptionist/DeliveryEntry';
import DeliveryHistory from './pages/receptionist/DeliveryHistory';

// Operator Pages
import LotProcessing from './pages/operator/LotProcessing';
import ProcessingLogs from './pages/operator/ProcessingLogs';
import BagManagement from './pages/operator/BagManagement';

// Sustainability Pages
import QualityChecks from './pages/sustainability/QualityChecks';
import ComplianceChecks from './pages/sustainability/ComplianceChecks';
import LotApproval from './pages/sustainability/LotApproval';

// Finance Pages
import ExpenseManagement from './pages/finance/ExpenseManagement';
import LaborCosts from './pages/finance/LaborCosts';
import AssetManagement from './pages/finance/AssetManagement';
import RevenueManagement from './pages/finance/RevenueManagement';
import FinancialStatements from './pages/finance/FinancialStatements';
import KPIs from './pages/finance/KPIs';

import './App.css';

const ProtectedLayout = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (user?.role !== allowedRole) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  // If not loading but no user, show login
  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedLayout allowedRole="admin"><AdminDashboard /></ProtectedLayout>} />
      <Route path="/admin/users" element={<ProtectedLayout allowedRole="admin"><UserManagement /></ProtectedLayout>} />
      <Route path="/admin/seasons" element={<ProtectedLayout allowedRole="admin"><SeasonManagement /></ProtectedLayout>} />
      <Route path="/admin/pricing" element={<ProtectedLayout allowedRole="admin"><PricingConfig /></ProtectedLayout>} />
      <Route path="/admin/farmers" element={<ProtectedLayout allowedRole="admin"><FarmerRegistry /></ProtectedLayout>} />
      <Route path="/admin/lots" element={<ProtectedLayout allowedRole="admin"><LotOverview /></ProtectedLayout>} />
      <Route path="/admin/reports" element={<ProtectedLayout allowedRole="admin"><Reports /></ProtectedLayout>} />
      <Route path="/admin/audit" element={<ProtectedLayout allowedRole="admin"><AuditLogs /></ProtectedLayout>} />

      {/* Receptionist Routes */}
      <Route path="/receptionist" element={<ProtectedLayout allowedRole="receptionist"><DeliveryEntry /></ProtectedLayout>} />
      <Route path="/receptionist/history" element={<ProtectedLayout allowedRole="receptionist"><DeliveryHistory /></ProtectedLayout>} />

      {/* Operator Routes */}
      <Route path="/operator" element={<ProtectedLayout allowedRole="operator"><LotProcessing /></ProtectedLayout>} />
      <Route path="/operator/logs" element={<ProtectedLayout allowedRole="operator"><ProcessingLogs /></ProtectedLayout>} />
      <Route path="/operator/bags" element={<ProtectedLayout allowedRole="operator"><BagManagement /></ProtectedLayout>} />

      {/* Sustainability Routes */}
      <Route path="/sustainability" element={<ProtectedLayout allowedRole="sustainability"><QualityChecks /></ProtectedLayout>} />
      <Route path="/sustainability/compliance" element={<ProtectedLayout allowedRole="sustainability"><ComplianceChecks /></ProtectedLayout>} />
      <Route path="/sustainability/approval" element={<ProtectedLayout allowedRole="sustainability"><LotApproval /></ProtectedLayout>} />

      {/* Finance Routes */}
      <Route path="/finance" element={<ProtectedLayout allowedRole="finance"><ExpenseManagement /></ProtectedLayout>} />
      <Route path="/finance/labor" element={<ProtectedLayout allowedRole="finance"><LaborCosts /></ProtectedLayout>} />
      <Route path="/finance/assets" element={<ProtectedLayout allowedRole="finance"><AssetManagement /></ProtectedLayout>} />
      <Route path="/finance/revenue" element={<ProtectedLayout allowedRole="finance"><RevenueManagement /></ProtectedLayout>} />
      <Route path="/finance/statements" element={<ProtectedLayout allowedRole="finance"><FinancialStatements /></ProtectedLayout>} />
      <Route path="/finance/kpis" element={<ProtectedLayout allowedRole="finance"><KPIs /></ProtectedLayout>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={`/${user?.role}`} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
