import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyOTP from './components/Auth/VerifyOTP';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import UploadSheet from './components/Dashboard/UploadSheet';
import Analytics from './components/Dashboard/Analytics';
import Reports from './components/Reports/Reports';
import Notifications from './components/Admin/Notifications';
import Settings from './components/Admin/Settings';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<UploadSheet />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#102a43',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 24px rgba(16,42,67,0.2)',
            },
            success: { iconTheme: { primary: '#0d9488', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;