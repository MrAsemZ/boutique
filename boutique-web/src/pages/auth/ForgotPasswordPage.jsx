import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnvelopeIcon, ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import api from '../../api/axios';
import { validateEmail } from '../../utils/validation';

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'auth-spin 0.7s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError(null);
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      setCooldown(60);
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || (isArabic ? 'حدث خطأ، حاول مجدداً' : 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setCooldown(60);
      toast.success(isArabic ? 'تم إعادة الإرسال' : 'Email resent');
    } catch {
      toast.error(isArabic ? 'حدث خطأ' : 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  const BackArrow = isArabic ? ArrowLongRightIcon : ArrowLongLeftIcon;

  const btnStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '50px',
    border: 'none',
    background: loading ? 'var(--theme-border)' : 'var(--theme-accent)',
    color: loading ? 'var(--theme-text-hint)' : 'var(--theme-bg)',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background 0.2s, transform 0.1s',
  };

  return (
    <AuthLayout>
      <style>{`@keyframes auth-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Back link */}
      <Link
        to="/login"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--theme-text-secondary)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '24px' }}
      >
        <BackArrow style={{ width: '18px', height: '18px' }} />
        {isArabic ? 'العودة لتسجيل الدخول' : 'Back to login'}
      </Link>

      {!submitted ? (
        <>
          {/* Lock icon */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--theme-accent) 12%, transparent)',
              marginBottom: '16px',
            }}>
              <EnvelopeIcon style={{ width: '36px', height: '36px', color: 'var(--theme-accent)' }} />
            </div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 8px' }}>
              {t('auth.forgot_password')}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--theme-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {isArabic
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
                : 'Enter your email and we\'ll send you a reset link'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormInput
              label={t('auth.email')}
              name="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
              error={emailError}
              icon={EnvelopeIcon}
              autoComplete="email"
            />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading
                ? <><Spinner />{isArabic ? 'جارٍ...' : 'Sending...'}</>
                : (isArabic ? 'إرسال رابط الاسترداد' : 'Send Reset Link')
              }
            </button>
          </form>
        </>
      ) : (
        /* Success state */
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#dcfce7',
            marginBottom: '20px',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 10px' }}>
            {isArabic ? 'تم إرسال البريد الإلكتروني!' : 'Email sent!'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--theme-text-secondary)', margin: '0 0 28px', lineHeight: 1.6 }}>
            {isArabic
              ? 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني'
              : 'We\'ve sent a password reset link to your email'
            }
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            style={{
              ...btnStyle,
              background: cooldown > 0 ? 'var(--theme-border)' : 'var(--theme-accent)',
              color: cooldown > 0 ? 'var(--theme-text-hint)' : 'var(--theme-bg)',
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {loading
              ? <><Spinner />{isArabic ? 'جارٍ...' : 'Sending...'}</>
              : cooldown > 0
                ? `${isArabic ? 'إعادة الإرسال بعد' : 'Resend in'} ${cooldown}s`
                : (isArabic ? 'لم تستلم البريد؟ إعادة الإرسال' : 'Didn\'t receive it? Resend')
            }
          </button>

          <Link
            to="/login"
            style={{ display: 'block', color: 'var(--theme-accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
          >
            {isArabic ? 'العودة لتسجيل الدخول' : 'Back to login'}
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
