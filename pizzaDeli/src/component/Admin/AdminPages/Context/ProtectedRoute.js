// components/ProtectedRoute.js
import { useAuth } from './AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole = 'ADMIN' }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Hoặc spinner loading
  }

  if (!user || user.role !== requiredRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}