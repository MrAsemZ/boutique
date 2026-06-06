import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { getGuestCart } from '../../utils/guestCart';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SocialCallbackPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    localStorage.setItem('auth_token', token);

    api.get('/auth/me')
      .then(async (r) => {
        // /me returns { success, message, data: user }
        const user = r.data?.data ?? r.data?.user ?? r.data ?? null;
        login(user, token);
        try {
          if (getGuestCart().items.length > 0) {
            await useCartStore.getState().mergeGuestCartToServer();
          }
        } catch {
          // merge failure must never block navigation
        }
        navigate('/', { replace: true });
      })
      .catch(() => {
        login(null, token);
        navigate('/', { replace: true });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--theme-bg)',
    }}>
      <LoadingSpinner size="lg" />
    </div>
  );
}
