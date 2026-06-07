import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import { useLogin } from '../../hooks/api/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';
import api from '../../api/axios';

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--theme-border)' }} />
      <span style={{ fontSize: '0.8125rem', color: 'var(--theme-text-hint)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--theme-border)' }} />
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'auth-spin 0.7s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { mutate: login, isPending } = useLogin();

  const validate = () => {
    const e = {};
    const emailErr = validateEmail(form.email);
    const pwErr = validatePassword(form.password, 6);
    if (emailErr) e.email = emailErr;
    if (pwErr) e.password = pwErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    login(form, {
      onSuccess: (data) => {
        toast.success(isArabic ? 'مرحباً بعودتك!' : 'Welcome back!');
        const user = data?.data?.user ?? data?.data?.data?.user;
        const from = location.state?.from;
        if (from && from !== '/login') {
          navigate(from, { replace: true });
        } else if (user?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user?.role === 'vendor') {
          navigate('/vendor/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || '';
        toast.error(msg || (isArabic ? 'بيانات غير صحيحة' : 'Invalid credentials'));
        const isVerifyError = msg.toLowerCase().includes('verify') || err?.response?.status === 403;
        if (isVerifyError) {
          setShowResendVerification(true);
          setVerificationEmail(form.email);
        }
      },
    });
  };

  const handleResendVerification = async () => {
    try {
      await api.post('/auth/resend-verification-email', { email: verificationEmail });
      toast.success(
        isArabic
          ? 'تم إرسال رسالة التحقق، تحقق من بريدك'
          : 'Verification email sent, check your inbox'
      );
      setShowResendVerification(false);
    } catch {
      toast.error(isArabic ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const btnStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '50px',
    border: 'none',
    background: isPending ? 'var(--theme-border)' : 'var(--theme-accent)',
    color: isPending ? 'var(--theme-text-hint)' : 'var(--theme-bg)',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: isPending ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background 0.2s, transform 0.1s',
  };

  return (
    <AuthLayout>
      <style>{`@keyframes auth-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--theme-accent)' }}>
          Boutique
        </span>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 6px', textAlign: 'center' }}>
        {isArabic ? 'مرحباً بعودتك' : 'Welcome back'}
      </h1>
      <p style={{ color: 'var(--theme-text-secondary)', fontSize: '0.9375rem', textAlign: 'center', margin: '0 0 28px' }}>
        {isArabic ? 'سجل دخولك للمتابعة' : 'Sign in to continue'}
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <FormInput
          label={t('auth.email')}
          name="email"
          type="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          icon={EnvelopeIcon}
          autoComplete="email"
        />

        <div>
          <FormInput
            label={t('auth.password')}
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            icon={LockClosedIcon}
            autoComplete="current-password"
          />
          <div style={{ textAlign: 'end', marginTop: '6px' }}>
            <Link
              to="/forgot-password"
              style={{ fontSize: '0.8125rem', color: 'var(--theme-accent)', textDecoration: 'none' }}
            >
              {t('auth.forgot_password')}
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={btnStyle}
          onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {isPending ? <><Spinner />{isArabic ? 'جارٍ...' : 'Loading...'}</> : t('auth.login')}
        </button>
      </form>

      {showResendVerification && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-border)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--theme-text-secondary)', marginBottom: '8px' }}>
            {isArabic ? 'لم تستلم رسالة التحقق؟' : "Didn't receive the verification email?"}
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            style={{
              fontSize: '13px',
              color: 'var(--theme-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isArabic ? 'إعادة إرسال رسالة التحقق' : 'Resend verification email'}
          </button>
        </div>
      )}

      <Divider label={isArabic ? 'أو' : 'or'} />

      <SocialLoginButtons />

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--theme-text-secondary)', marginTop: '24px' }}>
        {t('auth.no_account')}{' '}
        <Link to="/register" style={{ color: 'var(--theme-accent)', textDecoration: 'none', fontWeight: 600 }}>
          {t('auth.register')}
        </Link>
      </p>
    </AuthLayout>
  );
}
