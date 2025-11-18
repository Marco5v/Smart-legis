import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, setRegisterPresenceFn } from './context/AuthContext';
import { SessionProvider, useSession } from './context/SessionContext';

import LoginPage from './pages/LoginPage';
import ControladorDashboard from './pages/ControladorDashboard';
import PresidenteDashboard from './pages/PresidenteDashboard';
import VereadorInterface from './pages/VereadorInterface';
import PanelPage from './pages/PanelPage';
import SecretariaDashboard from './pages/SecretariaDashboard';
import PortalPublico from './pages/PortalPublico';
import ComissoesDashboard from './pages/ComissoesDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <SessionProvider>
      <HashRouter>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
      </HashRouter>
    </SessionProvider>
  );
};

const AppContent: React.FC = () => {
    const { registerPresence } = useSession();
    // Inject the registerPresence function into the AuthContext module to break dependency cycle.
    useEffect(() => {
        setRegisterPresenceFn(registerPresence);
    }, [registerPresence]);

    return (
        <Routes>
          <Route path="/panel" element={<PanelPage />} />
          <Route path="/*" element={<MainAppRoutes />} />
        </Routes>
    );
};

const MainAppRoutes: React.FC = () => {
    return (
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/portal" element={<PortalPublico />} />

          <Route path="/dashboard/controlador" element={<ProtectedRoute roles={[UserRole.CONTROLADOR]}><ControladorDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/presidente" element={<ProtectedRoute roles={[UserRole.PRESIDENTE, UserRole.MESA_DIRETORA]}><PresidenteDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/vereador" element={<ProtectedRoute roles={[UserRole.VEREADOR]}><VereadorInterface /></ProtectedRoute>} />
          <Route path="/dashboard/secretaria" element={<ProtectedRoute roles={[UserRole.SECRETARIA]}><SecretariaDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/comissoes" element={<ProtectedRoute roles={[UserRole.VEREADOR]}><ComissoesDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/analytics" element={<ProtectedRoute roles={[UserRole.PRESIDENTE, UserRole.SECRETARIA]}><AnalyticsDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

interface ProtectedRouteProps {
    children: React.ReactElement;
    roles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/" />;
    }

    if (!roles.includes(user.role)) {
        if(user.role === UserRole.VEREADOR) return <Navigate to="/dashboard/vereador" />;
        return <Navigate to="/" />;
    }

    return children;
};


export default App;