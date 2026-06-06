import { useTranslation } from 'react-i18next';
import { useVendorBalance, useVendorOrders } from '../../hooks/api/useVendor';
import { useAuthStore } from '../../stores/authStore';
import VendorLayout from '../../components/layout/VendorLayout';
import { formatPrice } from '../../utils/formatPrice';

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  paid_out:  { bg: '#D1FAE5', text: '#065F46' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  shipped:   { bg: '#EDE9FE', text: '#5B21B6' },
};

function MetricCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: 'var(--theme-surface)',
      border: '1px solid var(--theme-border)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px',
        background: `${color}1a`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '1.375rem' }}>{icon}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function StoreStatusBanner({ vendor, t }) {
  const status = vendor?.status ?? 'pending';
  const configs = {
    active:    { bg: '#D1FAE5', border: '#34D399', color: '#065F46', icon: '✓', text: t('vendor.status_active') },
    pending:   { bg: '#FEF3C7', border: '#FCD34D', color: '#92400E', icon: '⏳', text: t('vendor.pending_review') },
    suspended: { bg: '#FEE2E2', border: '#FCA5A5', color: '#991B1B', icon: '⚠️', text: t('vendor.suspended_warning') },
  };
  const cfg = configs[status] ?? configs.pending;

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: '12px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    }}>
      <span style={{ fontSize: '1.25rem' }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: cfg.color, fontSize: '0.9375rem' }}>
          {vendor?.store_name ?? vendor?.store_name_ar ?? ''}
        </div>
        <div style={{ fontSize: '0.8125rem', color: cfg.color, marginTop: '2px' }}>
          {cfg.text}
        </div>
      </div>
      <span style={{
        padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700,
        background: cfg.border, color: cfg.color,
      }}>
        {t(`vendor.status_${status}`)}
      </span>
    </div>
  );
}

export default function VendorDashboardPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { user } = useAuthStore();

  const { data: balanceData, isLoading: balanceLoading } = useVendorBalance();
  const { data: ordersData } = useVendorOrders(1, '');

  const balance = balanceData?.data ?? balanceData ?? {};
  const vendor = balance.vendor ?? user;
  const recentTx = balance.recent_transactions ?? [];
  const ordersTotal = ordersData?.meta?.total ?? ordersData?.data?.length ?? 0;

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  if (balanceLoading) {
    return (
      <VendorLayout>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: '90px', borderRadius: '12px', background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', animation: 'pulse 1.4s ease infinite' }} />
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '20px' }}>
        {t('vendor.dashboard')}
      </h1>

      {/* Store status banner */}
      <StoreStatusBanner vendor={vendor} t={t} />

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <MetricCard label={t('vendor.total_earned')} value={formatPrice(balance.total_earned ?? 0, lang)} icon="📈" color="#10B981" />
        <MetricCard label={t('vendor.pending_payout')} value={formatPrice(balance.pending_payout ?? 0, lang)} icon="⏳" color="#F59E0B" />
        <MetricCard label={t('vendor.paid_out')} value={formatPrice(balance.paid_out ?? 0, lang)} icon="✅" color="#10B981" />
        <MetricCard label={t('vendor.orders_count')} value={ordersTotal.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')} icon="🛍️" color="#6366F1" />
      </div>

      {/* Recent transactions */}
      <div style={{
        background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
        borderRadius: '14px', overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--theme-border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: 0 }}>
            {t('vendor.recent_transactions')}
          </h2>
        </div>

        {recentTx.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
            {t('vendor.no_transactions')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                  {[t('vendor.col_order'), t('vendor.col_product'), t('vendor.col_gross'), t('vendor.col_commission'), t('vendor.col_net'), t('vendor.col_status')].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'start', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTx.map((tx, idx) => {
                  const colors = STATUS_COLORS[tx.status] ?? STATUS_COLORS.pending;
                  return (
                    <tr key={tx.id ?? idx} style={{ borderBottom: '1px solid var(--theme-border)', background: idx % 2 === 0 ? 'var(--theme-surface)' : 'var(--theme-bg)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {tx.order_number ?? tx.order?.order_number ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'var(--theme-text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lang === 'ar' ? (tx.product_name_ar ?? tx.product_name ?? '—') : (tx.product_name ?? tx.product_name_ar ?? '—')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {formatPrice(tx.gross_amount ?? tx.amount ?? 0, lang)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#EF4444', whiteSpace: 'nowrap' }}>
                        -{formatPrice(tx.commission_amount ?? tx.commission ?? 0, lang)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#10B981', whiteSpace: 'nowrap' }}>
                        {formatPrice(tx.net_amount ?? tx.net ?? 0, lang)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: colors.bg, color: colors.text, whiteSpace: 'nowrap' }}>
                          {t(`vendor.status_${tx.status}`, tx.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
