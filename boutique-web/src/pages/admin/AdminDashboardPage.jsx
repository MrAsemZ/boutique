import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAdminOrders, useAdminOrdersToday } from '../../hooks/api/useAdmin';
import { useAdminVendors } from '../../hooks/api/useAdmin';
import { useAdminPayouts } from '../../hooks/api/useAdmin';
import { formatPrice } from '../../utils/formatPrice';

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  shipped:   { bg: '#EDE9FE', text: '#5B21B6' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const PAYMENT_COLORS = {
  unpaid:   { bg: '#FEF3C7', text: '#92400E' },
  paid:     { bg: '#D1FAE5', text: '#065F46' },
  refunded: { bg: '#F3F4F6', text: '#6B7280' },
};

function MetricCard({ label, value, icon, color, loading }) {
  return (
    <div style={{
      background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
      borderRadius: '14px', padding: '20px',
      display: 'flex', alignItems: 'flex-start', gap: '14px',
    }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>{label}</div>
        {loading
          ? <div style={{ width: '60px', height: '28px', borderRadius: '6px', background: 'var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
          : <div style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>{value}</div>
        }
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();

  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders({}, 1);
  const { data: todayData, isLoading: todayLoading } = useAdminOrdersToday();
  const { data: vendorsData, isLoading: vendorsLoading } = useAdminVendors('pending', 1);
  const { data: payoutsData, isLoading: payoutsLoading } = useAdminPayouts(1);

  const totalOrders   = ordersData?.meta?.total ?? 0;
  const todayOrders   = todayData?.meta?.total ?? 0;
  const pendingVendors = vendorsData?.data?.total ?? 0;
  const pendingPayouts = payoutsData?.meta?.total ?? 0;

  const recentOrders = (ordersData?.data ?? []).slice(0, 10);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <AdminLayout>
      <style>{`@keyframes adm-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '24px' }}>
        {t('admin.dashboard')}
      </h1>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <MetricCard label={t('admin.total_orders')} value={totalOrders} icon="📦" color="#6366F1" loading={ordersLoading} />
        <MetricCard label={t('admin.today_orders')} value={todayOrders} icon="📅" color="#F59E0B" loading={todayLoading} />
        <MetricCard label={t('admin.pending_vendors')} value={pendingVendors} icon="🏪" color="#EC4899" loading={vendorsLoading} />
        <MetricCard label={t('admin.pending_payouts')} value={pendingPayouts} icon="💰" color="#10B981" loading={payoutsLoading} />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/admin/vendors?status=pending')}
          style={{ padding: '10px 20px', borderRadius: '50px', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {t('admin.review_vendors')}
        </button>
        <button
          onClick={() => navigate('/admin/payouts')}
          style={{ padding: '10px 20px', borderRadius: '50px', background: 'none', color: 'var(--theme-accent)', fontWeight: 600, fontSize: '0.9rem', border: '1.5px solid var(--theme-accent)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {t('admin.pending_payouts_btn')}
        </button>
      </div>

      {/* Recent orders */}
      <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--theme-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
            {t('admin.recent_orders')}
          </h2>
          <button
            onClick={() => navigate('/admin/orders')}
            style={{ background: 'none', border: 'none', color: 'var(--theme-accent)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {lang === 'ar' ? 'عرض الكل' : 'View All'}
          </button>
        </div>

        {ordersLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: '40px', borderRadius: '8px', background: 'var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
            {t('admin.no_orders')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                  {[t('admin.col_order'), t('admin.col_total'), t('admin.col_payment_method'), t('admin.col_payment_status'), t('admin.col_status'), t('admin.col_date'), t('admin.col_actions')].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'start', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => {
                  const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
                  const pc = PAYMENT_COLORS[order.payment_status] ?? PAYMENT_COLORS.unpaid;
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--theme-border)', background: idx % 2 === 0 ? 'var(--theme-surface)' : 'var(--theme-bg)' }}>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {order.order_number}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {formatPrice(order.total, lang)}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                        {order.payment_method === 'cod' ? (lang === 'ar' ? 'نقداً' : 'COD') : 'CliQ'}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: pc.bg, color: pc.text, whiteSpace: 'nowrap' }}>
                          {t(`admin.payment_${order.payment_status}`, order.payment_status)}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.text, whiteSpace: 'nowrap' }}>
                          {t(`admin.status_${order.status}`, order.status)}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <button
                          onClick={() => navigate(`/admin/orders?highlight=${order.id}`)}
                          style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-primary)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
                        >
                          {t('admin.view')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
