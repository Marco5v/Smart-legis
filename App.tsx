import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, setRegisterPresenceFn } from './context/AuthContext';
import { SessionProvider, useSession } from './context/SessionContext';

// Pages
import LoginPage from './pages/LoginPage';
import PanelPage from './pages/PanelPage';
import PortalPublico from './pages/PortalPublico';
import ControladorDashboard from './pages/ControladorDashboard';
import PresidenteDashboard from './pages/PresidenteDashboard';
import VereadorInterface from './pages/VereadorInterface';
import SecretariaDashboard from './pages/SecretariaDashboard';
import ComissoesDashboard from './pages/ComissoesDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

// Helper component to handle the circular dependency logic
const AppContent: React.FC = () => {
    const { registerPresence } = useSession();

    useEffect(() => {
        // This function is imported from AuthContext and allows us to provide
        // the registerPresence function from SessionContext without a circular import.
        setRegisterPresenceFn(registerPresence);
    }, [registerPresence]);

    // Private Route Wrapper
    const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const { user } = useAuth();
        return user ? <>{children}</> : <Navigate to="/" />;
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/panel" element={<PanelPage />} />
            <Route path="/portal" element={<PortalPublico />} />

            {/* Private Dashboards */}
            <Route path="/dashboard/controlador" element={<PrivateRoute><ControladorDashboard /></PrivateRoute>} />
            <Route path="/dashboard/presidente" element={<PrivateRoute><PresidenteDashboard /></PrivateRoute>} />
            <Route path="/dashboard/vereador" element={<PrivateRoute><VereadorInterface /></PrivateRoute>} />
            <Route path="/dashboard/secretaria" element={<PrivateRoute><SecretariaDashboard /></PrivateRoute>} />
            <Route path="/dashboard/comissoes" element={<PrivateRoute><ComissoesDashboard /></PrivateRoute>} />
            <Route path="/dashboard/analytics" element={<PrivateRoute><AnalyticsDashboard /></PrivateRoute>} />

             {/* Redirect any other path to login */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <HashRouter>
        <SessionProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </SessionProvider>
    </HashRouter>
  );
};

export default App;
