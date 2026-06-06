import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function GuestGuard({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return children;

  // Role-based redirect for authenticated users
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }
  return <Navigate to="/" replace />;
}
