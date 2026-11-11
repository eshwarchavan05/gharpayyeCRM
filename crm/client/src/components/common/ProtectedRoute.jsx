import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm font-medium">Loading Gharpayy CRM...</span>
        </div>
      </div>
    );
  }

  // Guest users are permitted to explore the entire CRM demo
  if (isGuest) {
    return children;
  }

  // For logged-in users, enforce admin-only constraints if specified
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
