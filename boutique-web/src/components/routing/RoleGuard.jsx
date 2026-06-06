import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function RoleGuard({ role, children }) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (user?.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
