import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useUpdatePassword } from '../../hooks/api/useProfile';
import AccountLayout from '../../components/layout/AccountLayout';

function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

function StrengthBar({ password }) {
  const { t } = useTranslation();
  const strength = getStrength(password);
  if (!password) return null;

  const colors = ['#EF4444', '#F59E0B', '#10B981', '#10B981'];
  const labels = [
    t('password.strength_weak'),
    t('password.strength_weak'),
    t('password.strength_fair'),
    t('password.strength_strong'),
  ];

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: '4px', borderRadius: '4px',
              background: i <= strength ? colors[strength - 1] : 'var(--theme-border)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: colors[strength - 1] ?? 'var(--theme-text-hint)' }}>
        {labels[strength - 1] ?? ''}
      </span>
    </div>
  );
}

function PasswordField({ label, value, onChange, error }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  return (
    <div>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          style={{
            width: '100%', padding: '10px 44px 10px 14px', boxSizing: 'border-box',
            borderRadius: '10px', border: `1px solid ${error ? '#EF4444' : 'var(--theme-border)'}`,
            background: 'var(--theme-surface)', color: 'var(--theme-text-primary)',
            fontSize: '0.9375rem', outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--theme-accent)')}
          onBlur={(e) => (e.target.style.borderColor = error ? '#EF4444' : 'var(--theme-border)')}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: 'absolute', insetInlineEnd: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.75rem', color: 'var(--theme-text-secondary)', fontWeight: 500,
          }}
        >
          {show ? t('password.hide') : t('password.show')}
        </button>
      </div>
      {error && <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const updatePassword = useUpdatePassword();
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.current_password) errs.current_password = t('common.error');
    if (!form.password || form.password.length < 8) errs.password = t('common.error');
    if (form.password !== form.password_confirmation) errs.password_confirmation = t('password.mismatch');
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    updatePassword.mutate(form, {
      onSuccess: () => {
        toast.success(t('password.success'));
        setForm({ current_password: '', password: '', password_confirmation: '' });
      },
      onError: (err) => {
        const data = err?.response?.data;
        if (data?.errors) setErrors(data.errors);
        else if (data?.message) toast.error(data.message);
        else toast.error(t('common.error'));
      },
    });
  };

  return (
    <AccountLayout>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '28px' }}>
        {t('password.title')}
      </h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <PasswordField
          label={t('password.current')}
          value={form.current_password}
          onChange={setField('current_password')}
          error={errors.current_password}
        />

        <div>
          <PasswordField
            label={t('password.new')}
            value={form.password}
            onChange={setField('password')}
            error={errors.password}
          />
          <StrengthBar password={form.password} />
        </div>

        <PasswordField
          label={t('password.confirm')}
          value={form.password_confirmation}
          onChange={setField('password_confirmation')}
          error={errors.password_confirmation}
        />

        <div style={{ paddingTop: '8px' }}>
          <button
            type="submit"
            disabled={updatePassword.isPending}
            style={{
              padding: '13px 32px', borderRadius: '50px',
              background: 'var(--theme-accent)', color: 'var(--theme-surface)',
              fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer',
              opacity: updatePassword.isPending ? 0.7 : 1, transition: 'opacity 0.2s',
            }}
          >
            {updatePassword.isPending ? t('common.loading') : t('password.save')}
          </button>
        </div>
      </form>
    </AccountLayout>
  );
}
