import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function GuestGuard({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
