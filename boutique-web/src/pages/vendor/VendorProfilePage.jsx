import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import VendorLayout from '../../components/layout/VendorLayout';
import api from '../../api/axios';

function useVendorProfile() {
  return useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => api.get('/vendor/profile').then((r) => r.data),
  });
}

function useUpdateVendorProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put('/vendor/profile', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-profile'] }),
  });
}

export default function VendorProfilePage() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const { data, isLoading } = useVendorProfile();
  const updateProfile = useUpdateVendorProfile();

  const [form, setForm] = useState({
    store_name: '', store_name_ar: '',
    description: '', description_ar: '',
    logo: '', bank_account: '',
  });

  const vendor = data?.data;

  useEffect(() => {
    if (vendor) {
      setForm({
        store_name:     vendor.store_name     ?? '',
        store_name_ar:  vendor.store_name_ar  ?? '',
        description:    vendor.description    ?? '',
        description_ar: vendor.description_ar ?? '',
        logo:           vendor.logo           ?? '',
        bank_account:   vendor.bank_account   ?? '',
      });
    }
  }, [vendor?.id]);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(form, {
      onSuccess: () => toast.success(lang === 'ar' ? 'تم حفظ معلومات المتجر' : 'Store profile saved'),
      onError: (err) => toast.error(err?.response?.data?.message ?? (lang === 'ar' ? 'حدث خطأ' : 'Error')),
    });
  };

  const iStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', fontFamily: 'inherit', fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-secondary)', marginBottom: '6px' };

  const STATUS_CONFIG = {
    active:    { bg: '#D1FAE5', border: '#34D399', color: '#065F46', label: lang === 'ar' ? 'نشط' : 'Active' },
    pending:   { bg: '#FEF3C7', border: '#FCD34D', color: '#92400E', label: lang === 'ar' ? 'قيد المراجعة' : 'Under Review' },
    suspended: { bg: '#FEE2E2', border: '#FCA5A5', color: '#991B1B', label: lang === 'ar' ? 'موقوف' : 'Suspended' },
  };

  return (
    <VendorLayout>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '4px' }}>
        {lang === 'ar' ? 'معلومات المتجر' : 'Store Profile'}
      </h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)', marginBottom: '24px' }}>
        {lang === 'ar' ? 'إدارة معلومات متجرك وبياناتك البنكية' : 'Manage your store information and bank details'}
      </p>

      {/* Status banner */}
      {vendor && (() => {
        const cfg = STATUS_CONFIG[vendor.status] ?? STATUS_CONFIG.pending;
        return (
          <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '12px', padding: '12px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 700, color: cfg.color, fontSize: '0.875rem' }}>{cfg.label}</span>
            {vendor.commission_rate && (
              <span style={{ fontSize: '0.8125rem', color: cfg.color, opacity: 0.8 }}>
                — {lang === 'ar' ? 'عمولة المنصة' : 'Platform commission'}: {vendor.commission_rate}%
              </span>
            )}
          </div>
        );
      })()}

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
          {lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: '680px' }}>
          {/* Store names */}
          <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 18px' }}>
              {lang === 'ar' ? 'اسم المتجر' : 'Store Name'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الاسم (EN)' : 'Name (EN)'}</label>
                <input value={form.store_name} onChange={(e) => set('store_name', e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الاسم (AR)' : 'Name (AR)'}</label>
                <input value={form.store_name_ar} onChange={(e) => set('store_name_ar', e.target.value)} dir="rtl" style={iStyle} />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 18px' }}>
              {lang === 'ar' ? 'وصف المتجر' : 'Store Description'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الوصف (EN)' : 'Description (EN)'}</label>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} style={{ ...iStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الوصف (AR)' : 'Description (AR)'}</label>
                <textarea value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} rows={3} dir="rtl" style={{ ...iStyle, resize: 'vertical' }} />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 18px' }}>
              {lang === 'ar' ? 'شعار المتجر' : 'Store Logo'}
            </h2>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {form.logo && (
                <img
                  src={form.logo}
                  alt="logo preview"
                  onError={(e) => { e.target.style.display = 'none'; }}
                  style={{ width: '72px', height: '72px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--theme-border)', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: '1 1 240px' }}>
                <label style={labelStyle}>{lang === 'ar' ? 'رابط الشعار (URL)' : 'Logo URL'}</label>
                <input type="url" value={form.logo} onChange={(e) => set('logo', e.target.value)} placeholder="https://..." style={iStyle} />
              </div>
            </div>
          </div>

          {/* Bank account */}
          <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 6px' }}>
              {lang === 'ar' ? 'الحساب البنكي' : 'Bank Account'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', margin: '0 0 14px' }}>
              {lang === 'ar' ? 'سيتم استخدام هذه المعلومات لتحويل أرباحك' : 'This information will be used to transfer your earnings'}
            </p>
            <label style={labelStyle}>{lang === 'ar' ? 'تفاصيل الحساب' : 'Account Details'}</label>
            <input value={form.bank_account} onChange={(e) => set('bank_account', e.target.value)} placeholder={lang === 'ar' ? 'مثال: Jordan Ahli Bank — IBAN: JO...' : 'e.g. Jordan Ahli Bank — IBAN: JO...'} style={iStyle} />
          </div>

          <button
            type="submit"
            disabled={updateProfile.isPending}
            style={{ padding: '11px 28px', borderRadius: '50px', border: 'none', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', opacity: updateProfile.isPending ? 0.6 : 1 }}
          >
            {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </button>
        </form>
      )}
    </VendorLayout>
  );
}
