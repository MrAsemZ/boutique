import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/layout/AuthLayout';

export default function EmailVerifiedPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <AuthLayout>
      <style>{`
        @keyframes ev-circle {
          from { stroke-dashoffset: 226; opacity: 0; }
          20% { opacity: 1; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes ev-check {
          0%  { stroke-dashoffset: 60; opacity: 0; }
          40% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes ev-bounce {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {/* Animated checkmark */}
        <div style={{ animation: 'ev-bounce 0.5s ease forwards', display: 'inline-block', marginBottom: '24px' }}>
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44" cy="44" r="36"
              stroke="var(--theme-accent)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="color-mix(in srgb, var(--theme-accent) 10%, transparent)"
              strokeDasharray="226"
              strokeDashoffset="226"
              style={{ animation: 'ev-circle 0.6s ease 0.1s forwards' }}
            />
            <polyline
              points="28,46 38,56 60,32"
              fill="none"
              stroke="var(--theme-accent)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="60"
              strokeDashoffset="60"
              style={{ animation: 'ev-check 0.4s ease 0.55s forwards' }}
            />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 10px' }}>
          {isArabic ? 'تم التحقق من بريدك الإلكتروني!' : 'Email verified!'}
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--theme-text-secondary)', margin: '0 0 32px', lineHeight: 1.6 }}>
          {isArabic ? 'يمكنك الآن تسجيل الدخول إلى حسابك' : 'You can now sign in to your account'}
        </p>

        <Link
          to="/login"
          style={{
            display: 'inline-block',
            padding: '14px 40px',
            borderRadius: '50px',
            background: 'var(--theme-accent)',
            color: 'var(--theme-bg)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'opacity 0.2s, transform 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {isArabic ? 'تسجيل الدخول' : 'Sign In'}
        </Link>
      </div>
    </AuthLayout>
  );
}
