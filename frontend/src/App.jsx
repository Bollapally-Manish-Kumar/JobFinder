/**
 * App Component - Main routing configuration
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import ResumeBuilder from './pages/ResumeBuilder';
import SavedJobs from './pages/SavedJobs';
import MyApplications from './pages/MyApplications';
import AIJobMatch from './pages/AIJobMatch';
import OAuthSuccess from './pages/OAuthSuccess';
import AdminPayments from './pages/AdminPayments';
import AdminDashboard from './pages/AdminDashboard';
import Disclaimer from './pages/Disclaimer';
import Profile from './pages/Profile';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Hooks
import useAuthStore from './hooks/useAuthStore';

function App() {
  const { refreshUser, token } = useAuthStore();

  // Refresh user data on mount if token exists
  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, []);

  return (
    <Router>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/disclaimer" element={<Disclaimer />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Layout>
                <Payment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-builder"
          element={
            <ProtectedRoute>
              <Layout>
                <ResumeBuilder />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute>
              <Layout>
                <SavedJobs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <Layout>
                <MyApplications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-match"
          element={
            <ProtectedRoute>
              <Layout>
                <AIJobMatch />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Admin routes - Secret URL (not linked anywhere publicly) */}
        <Route
          path="/manage-jfp-9030405493"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminPayments />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Admin Dashboard - New combined admin panel */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
