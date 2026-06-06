import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAdminVendors, useApproveVendor, useRejectVendor } from '../../hooks/api/useAdmin';

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  active:    { bg: '#D1FAE5', text: '#065F46' },
  suspended: { bg: '#FEE2E2', text: '#991B1B' },
};

const TABS = ['', 'pending', 'active', 'suspended'];

function RejectDialog({ vendor, onConfirm, onCancel, loading, lang }) {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'var(--theme-surface)', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', border: '1px solid var(--theme-border)' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '8px' }}>
          {lang === 'ar' ? 'رفض البائع' : 'Reject Vendor'}
        </h3>
        <p style={{ color: 'var(--theme-text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
          {vendor?.store_name ?? vendor?.user?.name}
        </p>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '8px' }}>
          {lang === 'ar' ? 'سبب الرفض *' : 'Rejection Reason *'}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder={lang === 'ar' ? 'يرجى ذكر سبب رفض الطلب...' : 'Please provide a reason for rejection...'}
          style={{
            width: '100%', padding: '11px 14px', borderRadius: '10px', fontSize: '0.9rem',
            border: '1px solid var(--theme-border)', background: 'var(--theme-bg)',
            color: 'var(--theme-text-primary)', fontFamily: 'inherit', resize: 'vertical',
            boxSizing: 'border-box', marginBottom: '20px',
          }}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason)}
            disabled={!reason.trim() || loading}
            style={{ padding: '10px 20px', borderRadius: '50px', background: '#EF4444', color: '#fff', border: 'none', cursor: reason.trim() && !loading ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontWeight: 600, opacity: !reason.trim() || loading ? 0.6 : 1 }}
          >
            {loading ? (lang === 'ar' ? 'جارٍ...' : 'Loading...') : (lang === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVendorsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data, isLoading } = useAdminVendors(activeTab, page);
  const approve = useApproveVendor();
  const reject  = useRejectVendor();

  // Vendor paginator goes through ApiResponseTrait else-branch: data.data = paginator
  const paginator = data?.data ?? {};
  const vendors   = paginator?.data ?? [];
  const totalPages = paginator?.last_page ?? 1;
  const total      = paginator?.total ?? 0;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const handleApprove = (vendor) => {
    approve.mutate(vendor.id, {
      onSuccess: () => toast.success(lang === 'ar' ? 'تمت الموافقة على البائع' : 'Vendor approved'),
      onError: (err) => toast.error(err?.response?.data?.message ?? (lang === 'ar' ? 'حدث خطأ' : 'Error')),
    });
  };

  const handleRejectConfirm = (reason) => {
    reject.mutate(
      { id: rejectTarget.id, reason },
      {
        onSuccess: () => {
          toast.success(lang === 'ar' ? 'تم رفض طلب البائع' : 'Vendor rejected');
          setRejectTarget(null);
        },
        onError: (err) => toast.error(err?.response?.data?.message ?? (lang === 'ar' ? 'حدث خطأ' : 'Error')),
      },
    );
  };

  const tabLabels = {
    '':          t('admin.filter_all'),
    pending:    t('admin.vendor_status_pending'),
    active:     t('admin.vendor_status_active'),
    suspended:  t('admin.vendor_status_suspended'),
  };

  return (
    <AdminLayout>
      <style>{`@keyframes adm-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      {rejectTarget && (
        <RejectDialog
          vendor={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          loading={reject.isPending}
          lang={lang}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: 0 }}>
          {t('admin.vendors')}
        </h1>
        <span style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)' }}>
          {total} {lang === 'ar' ? 'بائع' : 'vendors'}
        </span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            style={{
              padding: '8px 18px', borderRadius: '50px', fontWeight: activeTab === tab ? 700 : 500,
              fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              background: activeTab === tab ? 'var(--theme-accent)' : 'none',
              color: activeTab === tab ? 'var(--theme-surface)' : 'var(--theme-text-secondary)',
              border: `1.5px solid ${activeTab === tab ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
            }}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Vendor cards */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '160px', borderRadius: '14px', background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
          {t('admin.no_vendors')}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {vendors.map((vendor) => {
            const sc = STATUS_COLORS[vendor.status] ?? STATUS_COLORS.pending;
            return (
              <div key={vendor.id} style={{
                background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
                borderRadius: '14px', padding: '20px',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--theme-text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {vendor.store_name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
                      {vendor.user?.name} · {vendor.user?.email}
                    </div>
                  </div>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.text, flexShrink: 0 }}>
                    {t(`admin.vendor_status_${vendor.status}`, vendor.status)}
                  </span>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
                  <span>{lang === 'ar' ? 'العمولة:' : 'Commission:'} <strong style={{ color: 'var(--theme-text-primary)' }}>{vendor.commission_rate ?? 0}%</strong></span>
                  <span>{lang === 'ar' ? 'التاريخ:' : 'Applied:'} <strong style={{ color: 'var(--theme-text-primary)' }}>{formatDate(vendor.created_at)}</strong></span>
                </div>

                {/* Actions */}
                {vendor.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(vendor)}
                      disabled={approve.isPending}
                      style={{ flex: 1, padding: '9px 0', borderRadius: '50px', background: '#10B981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit', opacity: approve.isPending ? 0.7 : 1 }}
                    >
                      {t('admin.approve')}
                    </button>
                    <button
                      onClick={() => setRejectTarget(vendor)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: '50px', background: 'none', color: '#EF4444', border: '1.5px solid #EF4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit' }}
                    >
                      {t('admin.reject')}
                    </button>
                  </div>
                )}

                {vendor.status === 'active' && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-hint)', textAlign: 'center', padding: '8px 0' }}>
                    {lang === 'ar' ? 'البائع نشط — لا توجد إجراءات متاحة' : 'Vendor is active — no actions available'}
                  </div>
                )}

                {vendor.status === 'suspended' && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-hint)', textAlign: 'center', padding: '8px 0' }}>
                    {lang === 'ar' ? 'تم رفض هذا الطلب' : 'This application was rejected'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: '7px 13px', borderRadius: '50px',
                border: `1.5px solid ${p === page ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                background: p === page ? 'var(--theme-accent)' : 'none',
                color: p === page ? 'var(--theme-surface)' : 'var(--theme-text-secondary)',
                cursor: 'pointer', fontWeight: p === page ? 600 : 400, fontSize: '0.875rem', fontFamily: 'inherit',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
