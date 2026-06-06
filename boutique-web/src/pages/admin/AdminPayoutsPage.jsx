import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAdminPayouts, useMarkVendorPaid } from '../../hooks/api/useAdmin';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminPayoutsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState(null);

  const { data, isLoading } = useAdminPayouts(page);
  const markPaid = useMarkVendorPaid();

  const payouts    = data?.data ?? [];
  const meta       = data?.meta ?? {};
  const totalPages = meta.last_page ?? 1;

  const totalPending = payouts.reduce((sum, p) => sum + (p.pending_amount ?? 0), 0);

  const handleMarkPaid = (vendorId) => {
    markPaid.mutate(vendorId, {
      onSuccess: () => {
        toast.success(lang === 'ar' ? 'تم تأكيد الدفع' : 'Payout marked as paid');
        setConfirmId(null);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? (lang === 'ar' ? 'حدث خطأ' : 'Error'));
        setConfirmId(null);
      },
    });
  };

  return (
    <AdminLayout>
      <style>{`@keyframes adm-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '24px' }}>
        {t('admin.payouts')}
      </h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>{t('admin.total_pending')}</div>
          {isLoading
            ? <div style={{ width: '80px', height: '28px', borderRadius: '6px', background: 'var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
            : <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>{formatPrice(totalPending, lang)}</div>
          }
        </div>
        <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>{t('admin.vendors_awaiting')}</div>
          {isLoading
            ? <div style={{ width: '40px', height: '28px', borderRadius: '6px', background: 'var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
            : <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>{meta.total ?? payouts.length}</div>
          }
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: '44px', borderRadius: '8px', background: 'var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
            {t('admin.no_payouts')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                  {[t('admin.payout_col_store'), t('admin.payout_col_owner'), t('admin.payout_col_amount'), t('admin.payout_col_bank'), t('admin.payout_col_actions')].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'start', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout, idx) => (
                  <tr key={payout.vendor_id} style={{ borderBottom: '1px solid var(--theme-border)', background: idx % 2 === 0 ? 'var(--theme-surface)' : 'var(--theme-bg)' }}>
                    <td style={{ padding: '11px 14px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                      {payout.store_name ?? '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                      {payout.vendor_name ?? '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.9rem', fontWeight: 700, color: '#10B981', whiteSpace: 'nowrap' }}>
                      {formatPrice(payout.pending_amount ?? 0, lang)}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', fontFamily: 'monospace' }}>
                      {payout.bank_account ?? <span style={{ fontFamily: 'inherit', color: 'var(--theme-text-hint)' }}>{lang === 'ar' ? 'غير محدد' : 'Not set'}</span>}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {confirmId === payout.vendor_id ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                            {lang === 'ar' ? 'تأكيد؟' : 'Confirm?'}
                          </span>
                          <button
                            onClick={() => handleMarkPaid(payout.vendor_id)}
                            disabled={markPaid.isPending}
                            style={{ padding: '5px 12px', borderRadius: '8px', background: '#10B981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit', fontWeight: 600 }}
                          >
                            {markPaid.isPending ? '...' : (lang === 'ar' ? 'نعم' : 'Yes')}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit' }}
                          >
                            {lang === 'ar' ? 'لا' : 'No'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(payout.vendor_id)}
                          style={{ padding: '6px 14px', borderRadius: '8px', background: 'none', border: '1.5px solid #10B981', color: '#10B981', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit', fontWeight: 600 }}
                        >
                          {t('admin.mark_paid')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
