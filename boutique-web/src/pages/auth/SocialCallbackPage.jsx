import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
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

    // Set token in localStorage so the axios header picks it up
    localStorage.setItem('auth_token', token);

    api.get('/auth/me')
      .then((r) => {
        login(r.data?.user ?? r.data, token);
        navigate('/', { replace: true });
      })
      .catch(() => {
        // Token might still be valid even if /me fails; store minimal auth state
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
