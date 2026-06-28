import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import ConnectionsPage from './pages/ConnectionsPage';
import RequestsPage from './pages/RequestsPage';
import EditProfilePage from './pages/EditProfilePage';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) return children;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
};

const AppRoutes = () => (
  <AppLayout>
    <Routes>
      <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/dashboard"       element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/profile/edit"    element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
      <Route path="/profile/:id"     element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/discover"        element={<PrivateRoute><DiscoverPage /></PrivateRoute>} />
      <Route path="/connections"     element={<PrivateRoute><ConnectionsPage /></PrivateRoute>} />
      <Route path="/requests"        element={<PrivateRoute><RequestsPage /></PrivateRoute>} />
      <Route path="/"                element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </AppLayout>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1c2333', color: '#e8eaf0', border: '1px solid #2a3350' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
