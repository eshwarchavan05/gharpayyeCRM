import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CrmProvider } from './context/CrmContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Leads from './pages/Leads';
import Schedule from './pages/Schedule';
import CalendarPage from './pages/CalendarPage';
import Marketplace from './pages/Marketplace';
import SupplyHub from './pages/SupplyHub';
import Outreach from './pages/Outreach';
import Pipeline from './pages/Pipeline';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <CrmProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1D22',
                color: '#E8EAF0',
                border: '1px solid #252830',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'DM Sans, sans-serif',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#1A1D22' } },
              error: { iconTheme: { primary: '#FF4444', secondary: '#1A1D22' } },
            }}
          />
          <Routes>
            {/* Public Authentication Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Direct Demo / Authenticated CRM Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="leads" element={<Leads />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="supply" element={<SupplyHub />} />
              <Route path="outreach" element={<Outreach />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            {/* Unknown routes redirect to dashboard root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CrmProvider>
    </AuthProvider>
  );
}
