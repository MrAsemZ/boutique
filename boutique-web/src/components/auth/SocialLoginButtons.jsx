import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const socialBtnBase = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  width: '100%',
  padding: '11px 20px',
  borderRadius: '50px',
  cursor: 'pointer',
  fontSize: '0.9375rem',
  fontWeight: 500,
  transition: 'opacity 0.15s, box-shadow 0.15s',
  border: 'none',
};

export default function SocialLoginButtons() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const handleGoogle = () => { window.location.href = `${API_BASE}/auth/social/google/redirect`; };
  const handleFacebook = () => { window.location.href = `${API_BASE}/auth/social/facebook/redirect`; };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button
        type="button"
        onClick={handleGoogle}
        style={{ ...socialBtnBase, background: '#fff', color: '#374151', border: '1px solid #E5E7EB' }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        <GoogleIcon />
        {isArabic ? 'تسجيل الدخول بـ Google' : 'Continue with Google'}
      </button>

      <button
        type="button"
        onClick={handleFacebook}
        style={{ ...socialBtnBase, background: '#1877F2', color: '#fff' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <FacebookIcon />
        {isArabic ? 'تسجيل الدخول بـ Facebook' : 'Continue with Facebook'}
      </button>
    </div>
  );
}
