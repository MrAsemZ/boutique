import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApplyAsVendor } from '../../hooks/api/useVendor';

const BENEFITS_ICONS = ['🛍️', '📊', '🎧'];

export default function VendorApplyPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const applyMutation = useApplyAsVendor();

  const [form, setForm] = useState({
    store_name: '',
    store_name_ar: '',
    description: '',
    description_ar: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.store_name.trim()) errs.store_name = t('common.error');
    if (!form.store_name_ar.trim()) errs.store_name_ar = t('common.error');
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    applyMutation.mutate(form, {
      onSuccess: () => setSubmitted(true),
      onError: (err) => {
        if (err?.response?.status === 409) {
          setAlreadyApplied(true);
        } else {
          const data = err?.response?.data;
          if (data?.errors) setErrors(data.errors);
          else setErrors({ _general: t('common.error') });
        }
      },
    });
  };

  const inputStyle = (key) => ({
    padding: '11px 14px', borderRadius: '10px', fontSize: '0.9375rem',
    border: `1px solid ${errors[key] ? '#EF4444' : 'var(--theme-border)'}`,
    background: 'var(--theme-surface)', color: 'var(--theme-text-primary)',
    width: '100%', boxSizing: 'border-box', outline: 'none',
    fontFamily: 'inherit', resize: 'vertical',
    transition: 'border-color 0.2s',
  });

  // Success state
  if (submitted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--theme-bg)' }}>
        <div style={{ maxWidth: '460px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '12px' }}>
            {lang === 'ar' ? 'تم تقديم طلبك!' : 'Application Submitted!'}
          </h1>
          <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '28px', lineHeight: 1.7 }}>
            {t('vendor.apply_success')}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '13px 32px', borderRadius: '50px',
              background: 'var(--theme-accent)', color: 'var(--theme-surface)',
              fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer',
            }}
          >
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  // Already applied state
  if (alreadyApplied) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--theme-bg)' }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '12px' }}>
            {t('vendor.apply_already')}
          </h1>
          <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '24px' }}>
            {t('vendor.pending_review')}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '12px 28px', borderRadius: '50px', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  const benefits = [1, 2, 3].map((n) => ({ icon: BENEFITS_ICONS[n - 1], text: t(`vendor.apply_benefit_${n}`) }));

  return (
    <div style={{ background: 'var(--theme-bg)', minHeight: '80vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏪</div>
          <h1 style={{ fontSize: 'clamp(1.375rem, 4vw, 1.75rem)', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '10px' }}>
            {t('vendor.apply_title')}
          </h1>
          <p style={{ color: 'var(--theme-text-secondary)', fontSize: '1rem', maxWidth: '440px', margin: '0 auto' }}>
            {t('vendor.apply_subtitle')}
          </p>
        </div>

        {/* Benefits */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '36px' }}>
          {benefits.map((b, i) => (
            <div key={i} style={{
              background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
              borderRadius: '12px', padding: '16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '1.75rem' }}>{b.icon}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)', lineHeight: 1.5 }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '16px', padding: '28px' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '24px' }}>
            {lang === 'ar' ? 'معلومات المتجر' : 'Store Information'}
          </h2>

          {errors._general && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.875rem', color: '#991B1B' }}>
              {errors._general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Store names */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
                  {t('vendor.apply_store_name')} *
                </label>
                <input
                  value={form.store_name}
                  onChange={setField('store_name')}
                  placeholder="e.g. My Fashion Store"
                  style={inputStyle('store_name')}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--theme-accent)')}
                  onBlur={(e) => (e.target.style.borderColor = errors.store_name ? '#EF4444' : 'var(--theme-border)')}
                />
                {errors.store_name && <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>{errors.store_name}</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
                  {t('vendor.apply_store_name_ar')} *
                </label>
                <input
                  value={form.store_name_ar}
                  onChange={setField('store_name_ar')}
                  placeholder="مثال: متجر الأزياء"
                  dir="rtl"
                  style={{ ...inputStyle('store_name_ar'), textAlign: 'right' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--theme-accent)')}
                  onBlur={(e) => (e.target.style.borderColor = errors.store_name_ar ? '#EF4444' : 'var(--theme-border)')}
                />
                {errors.store_name_ar && <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>{errors.store_name_ar}</span>}
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
                {t('vendor.apply_description')}
              </label>
              <textarea
                value={form.description}
                onChange={setField('description')}
                rows={3}
                placeholder="Tell us about your store..."
                style={{ ...inputStyle('description'), resize: 'vertical' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--theme-accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--theme-border)')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
                {t('vendor.apply_description_ar')}
              </label>
              <textarea
                value={form.description_ar}
                onChange={setField('description_ar')}
                rows={3}
                dir="rtl"
                placeholder="أخبرنا عن متجرك..."
                style={{ ...inputStyle('description_ar'), resize: 'vertical', textAlign: 'right' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--theme-accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--theme-border)')}
              />
            </div>

            <div style={{ paddingTop: '8px' }}>
              <button
                type="submit"
                disabled={applyMutation.isPending}
                style={{
                  width: '100%', padding: '14px', borderRadius: '50px',
                  background: 'var(--theme-accent)', color: 'var(--theme-surface)',
                  fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer',
                  opacity: applyMutation.isPending ? 0.7 : 1, transition: 'opacity 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {applyMutation.isPending ? t('common.loading') : t('vendor.apply_submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
