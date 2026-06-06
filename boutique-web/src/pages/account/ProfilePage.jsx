import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { useUpdateProfile } from '../../hooks/api/useProfile';
import AccountLayout from '../../components/layout/AccountLayout';

const GENDERS = ['male', 'female', 'prefer_not_to_say'];
const LANGUAGES = [{ code: 'ar', label: 'العربية' }, { code: 'en', label: 'English' }];
const THEMES = ['default', 'warm', 'luxury', 'streetwear', 'kids', 'accessories'];

function PillSelector({ options, value, onChange, tPrefix }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map((opt) => {
        const key = typeof opt === 'string' ? opt : opt.code;
        const label = typeof opt === 'string' ? t(`${tPrefix}.${opt}`) : opt.label;
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              padding: '7px 16px', borderRadius: '50px', fontSize: '0.875rem',
              fontWeight: active ? 600 : 400, cursor: 'pointer',
              border: `1.5px solid ${active ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
              background: active ? 'color-mix(in srgb, var(--theme-accent) 12%, transparent)' : 'none',
              color: active ? 'var(--theme-accent)' : 'var(--theme-text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--theme-text-hint)', margin: 0 }}>{hint}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: 'prefer_not_to_say',
    language: 'ar',
    theme: 'default',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        phone: user.phone ?? '',
        gender: user.gender ?? 'prefer_not_to_say',
        language: user.language ?? i18n.language ?? 'ar',
        theme: user.theme ?? 'default',
      });
    }
  }, [user, i18n.language]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setInput = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = t('common.error');
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    updateProfile.mutate(form, {
      onSuccess: () => {
        toast.success(t('profile.save_success'));
        if (form.language !== i18n.language) {
          i18n.changeLanguage(form.language);
        }
      },
      onError: (err) => {
        const data = err?.response?.data;
        if (data?.errors) setErrors(data.errors);
        else toast.error(t('common.error'));
      },
    });
  };

  const inputStyle = (hasErr) => ({
    padding: '10px 14px',
    borderRadius: '10px',
    border: `1px solid ${hasErr ? '#EF4444' : 'var(--theme-border)'}`,
    background: 'var(--theme-surface)',
    color: 'var(--theme-text-primary)',
    fontSize: '0.9375rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  return (
    <AccountLayout>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '28px' }}>
        {t('profile.title')}
      </h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--theme-accent)', color: 'var(--theme-surface)',
            fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {(form.name || user?.name || '?').split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--theme-text-primary)' }}>{form.name || user?.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>{user?.email}</div>
          </div>
        </div>

        <Field label={t('profile.name')}>
          <input
            value={form.name}
            onChange={setInput('name')}
            style={inputStyle(errors.name)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--theme-accent)')}
            onBlur={(e) => (e.target.style.borderColor = errors.name ? '#EF4444' : 'var(--theme-border)')}
          />
          {errors.name && <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>{errors.name}</span>}
        </Field>

        <Field label={t('profile.email')} hint={t('profile.email_readonly')}>
          <input
            value={user?.email ?? ''}
            readOnly
            style={{ ...inputStyle(false), opacity: 0.6, cursor: 'not-allowed' }}
          />
        </Field>

        <Field label={t('profile.phone')}>
          <input
            value={form.phone}
            onChange={setInput('phone')}
            type="tel"
            style={inputStyle(false)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--theme-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--theme-border)')}
          />
        </Field>

        <Field label={t('profile.gender')}>
          <PillSelector options={GENDERS} value={form.gender} onChange={set('gender')} tPrefix="profile" />
        </Field>

        <Field label={t('profile.language')}>
          <PillSelector options={LANGUAGES} value={form.language} onChange={set('language')} tPrefix="profile" />
        </Field>

        <Field label={t('profile.theme')}>
          <select
            value={form.theme}
            onChange={setInput('theme')}
            style={{ ...inputStyle(false), appearance: 'none', cursor: 'pointer' }}
          >
            {THEMES.map((th) => (
              <option key={th} value={th}>{t(`profile.theme_${th}`)}</option>
            ))}
          </select>
        </Field>

        <div style={{ paddingTop: '8px' }}>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            style={{
              padding: '13px 32px', borderRadius: '50px',
              background: 'var(--theme-accent)', color: 'var(--theme-surface)',
              fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer',
              opacity: updateProfile.isPending ? 0.7 : 1, transition: 'opacity 0.2s',
            }}
          >
            {updateProfile.isPending ? t('common.loading') : t('profile.save_changes')}
          </button>
        </div>
      </form>
    </AccountLayout>
  );
}
