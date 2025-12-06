import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import PanelPage from './pages/PanelPage';
import PortalPublico from './pages/PortalPublico';
import PresidenteDashboard from './pages/PresidenteDashboard';
import SecretariaDashboard from './pages/SecretariaDashboard';
import ControladorDashboard from './pages/ControladorDashboard';
import VereadorInterface from './pages/VereadorInterface';
import ComissoesDashboard from './pages/ComissoesDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SupportDashboard from './pages/SupportDashboard';
import { UserRole } from './types';
import SplashScreen from './components/SplashScreen';

const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return <SplashScreen />;
    }
    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
          <SessionProvider>
              <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/panel" element={<PanelPage />} />
                  <Route path="/portal" element={<PortalPublico />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.PRESIDENTE, UserRole.MESA_DIRETORA]} />}>
                      <Route path="/dashboard/presidente" element={<PresidenteDashboard />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.SECRETARIA]} />}>
                      <Route path="/dashboard/secretaria" element={<SecretariaDashboard />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.CONTROLADOR]} />}>
                      <Route path="/dashboard/controlador" element={<ControladorDashboard />} />
                  </Route>
                   <Route element={<ProtectedRoute allowedRoles={[UserRole.VEREADOR, UserRole.PRESIDENTE]} />}>
                      <Route path="/dashboard/vereador" element={<VereadorInterface />} />
                  </Route>
                   <Route element={<ProtectedRoute allowedRoles={[UserRole.VEREADOR, UserRole.PRESIDENTE, UserRole.ASSESSORIA]} />}>
                      <Route path="/dashboard/comissoes" element={<ComissoesDashboard />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.PRESIDENTE, UserRole.SECRETARIA]} />}>
                      <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
                  </Route>
                   <Route element={<ProtectedRoute allowedRoles={[UserRole.SUPORTE]} />}>
                      <Route path="/dashboard/support" element={<SupportDashboard />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" />} />
              </Routes>
          </SessionProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
