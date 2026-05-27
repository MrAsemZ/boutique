import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function RoleGuard({ role, children }) {
  const { user } = useAuthStore();
  if (!user || user.role !== role) return <Navigate to="/" replace />;
  return children;
}
