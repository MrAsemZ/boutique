import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import PasswordStrength from '../../components/auth/PasswordStrength';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import { useRegister } from '../../hooks/api/useAuth';

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--theme-border)' }} />
      <span style={{ fontSize: '0.8125rem', color: 'var(--theme-text-hint)' }}>{label}</span>
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

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', gender: null });
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const validate = (formData) => {
  const e = {};

  if (!formData.name?.trim())
    e.name = isArabic ? 'الاسم مطلوب' : 'Name is required';

  if (!formData.email?.trim())
    e.email = isArabic ? 'البريد الإلكتروني مطلوب' : 'Email is required';

  if (!formData.password || formData.password.length < 8)
    e.password = isArabic ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';

  if (formData.password !== formData.confirmPassword)
    e.confirmPassword = isArabic ? 'كلمة المرور غير متطابقة' : 'Passwords do not match';

  if (!formData.gender)
    e.gender = isArabic ? 'الجنس مطلوب' : 'Gender is required';

  if (!termsAccepted)
    e.terms = isArabic ? 'يجب الموافقة على الشروط' : 'You must accept the terms';

  setErrors(e);
  return Object.keys(e).length === 0;
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: null }));
  };

  // Maps known Laravel English validation messages to bilingual equivalents.
  // Also handles the password_confirmation → confirmPassword key rename.
  const mapApiErrors = (rawErrors) => {
    const FIELD_MAP = { password_confirmation: 'confirmPassword' };
    const MSG_MAP = {
      'The password field confirmation does not match.':
        isArabic ? 'كلمة المرور غير متطابقة' : 'Passwords do not match',
      'The email has already been taken.':
        isArabic ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already taken',
      'The password field must be at least 8 characters.':
        isArabic ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters',
      'The name field is required.':
        isArabic ? 'الاسم مطلوب' : 'Name is required',
      'The email field is required.':
        isArabic ? 'البريد الإلكتروني مطلوب' : 'Email is required',
      'The email field must be a valid email address.':
        isArabic ? 'بريد إلكتروني غير صحيح' : 'Invalid email address',
    };

    const mapped = {};
    Object.entries(rawErrors).forEach(([apiKey, val]) => {
      const stateKey = FIELD_MAP[apiKey] ?? apiKey;
      const rawMsg = Array.isArray(val) ? val[0] : val;
      mapped[stateKey] = MSG_MAP[rawMsg] ?? rawMsg;
    });
    return mapped;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validate(form);
    if (!isValid) return;
    const payload = { ...form };
    delete payload.confirmPassword;
    payload.password_confirmation = form.confirmPassword;
    register(payload, {
      onSuccess: () => {
        toast.success(isArabic ? 'تم إنشاء حسابك! تحقق من بريدك الإلكتروني' : 'Account created! Check your email');
        navigate('/login');
      },
      onError: (err) => {
        const data = err?.response?.data;
        if (data?.errors) {
          setErrors((prev) => ({ ...prev, ...mapApiErrors(data.errors) }));
        } else {
          toast.error(data?.message || (isArabic ? 'حدث خطأ' : 'Registration failed'));
        }
      },
    });
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

  const genderPill = (g) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '50px',
    border: `1.5px solid ${form.gender === g ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
    background: form.gender === g ? 'var(--theme-accent)' : 'transparent',
    color: form.gender === g ? 'var(--theme-bg)' : 'var(--theme-text-secondary)',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.9375rem',
    transition: 'all 0.2s',
    textAlign: 'center',
  });

  return (
    <AuthLayout>
      <style>{`@keyframes auth-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--theme-accent)' }}>Boutique</span>
      </div>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 6px', textAlign: 'center' }}>
        {isArabic ? 'إنشاء حساب جديد' : 'Create your account'}
      </h1>
      <p style={{ color: 'var(--theme-text-secondary)', fontSize: '0.9rem', textAlign: 'center', margin: '0 0 24px' }}>
        {isArabic ? 'انضم إلى مجتمعنا الآن' : 'Join our community today'}
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FormInput
          label={t('auth.name')}
          name="name"
          type="text"
          placeholder={isArabic ? 'الاسم الكامل' : 'Full Name'}
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          icon={UserIcon}
          autoComplete="name"
        />

        <FormInput
          label={t('auth.email')}
          name="email"
          type="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={handleChange}
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
            onChange={handleChange}
            error={errors.password}
            icon={LockClosedIcon}
            autoComplete="new-password"
          />
          <PasswordStrength password={form.password} />
        </div>

        <FormInput
          label={isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={LockClosedIcon}
          autoComplete="new-password"
        />

        {/* Gender selector */}
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--theme-text-secondary)', margin: '0 0 8px' }}>
            {t('auth.gender')}
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['male', 'female'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => { setForm((f) => ({ ...f, gender: g })); setErrors((er) => ({ ...er, gender: null })); }}
                style={genderPill(g)}
              >
                {isArabic ? (g === 'male' ? 'ذكر' : 'أنثى') : t(`auth.${g}`)}
              </button>
            ))}
          </div>
          {errors.gender && <p style={{ fontSize: '0.8125rem', color: '#ef4444', margin: '4px 0 0' }}>{errors.gender}</p>}
        </div>

        {/* Terms checkbox */}
        <div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => { setTermsAccepted(e.target.checked); if (errors.terms) setErrors((er) => ({ ...er, terms: null })); }}
              style={{ marginTop: '2px', accentColor: 'var(--theme-accent)', flexShrink: 0 }}
            />
            <span style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)', lineHeight: 1.5 }}>
              {isArabic ? 'أوافق على ' : 'I agree to the '}
              <a href="#" style={{ color: 'var(--theme-accent)', textDecoration: 'none' }}>
                {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
              </a>
            </span>
          </label>
          {errors.terms && <p style={{ fontSize: '0.8125rem', color: '#ef4444', margin: '4px 0 0' }}>{errors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={btnStyle}
          onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {isPending ? <><Spinner />{isArabic ? 'جارٍ...' : 'Loading...'}</> : t('auth.register')}
        </button>
      </form>

      <Divider label={isArabic ? 'أو' : 'or'} />
      <SocialLoginButtons />

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--theme-text-secondary)', marginTop: '20px' }}>
        {t('auth.have_account')}{' '}
        <Link to="/login" style={{ color: 'var(--theme-accent)', textDecoration: 'none', fontWeight: 600 }}>
          {t('auth.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
