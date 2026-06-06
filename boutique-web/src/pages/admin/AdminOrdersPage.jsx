import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAdminOrders, useUpdateAdminOrderStatus } from '../../hooks/api/useAdmin';
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

// Allowed transitions per the backend's allowedTransitions map
const NEXT_STATUSES = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped:   ['delivered'],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [statusFilter, setStatusFilter]     = useState('');
  const [paymentFilter, setPaymentFilter]   = useState('');
  const [page, setPage] = useState(1);

  const filters = {
    ...(statusFilter  ? { status: statusFilter }         : {}),
    ...(paymentFilter ? { payment_status: paymentFilter } : {}),
  };

  const { data, isLoading } = useAdminOrders(filters, page);
  const updateStatus = useUpdateAdminOrderStatus();

  const orders    = data?.data ?? [];
  const meta      = data?.meta ?? {};
  const totalPages = meta.last_page ?? 1;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === order.status) return;
    updateStatus.mutate(
      { id: order.id, status: newStatus },
      {
        onSuccess: () => toast.success(lang === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated'),
        onError: (err) => toast.error(err?.response?.data?.message ?? (lang === 'ar' ? 'حدث خطأ' : 'Error')),
      },
    );
  };

  const statusOptions = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const paymentOptions = ['', 'unpaid', 'paid', 'refunded'];

  const selectStyle = {
    padding: '9px 12px', borderRadius: '10px', fontSize: '0.875rem',
    border: '1px solid var(--theme-border)', background: 'var(--theme-surface)',
    color: 'var(--theme-text-primary)', fontFamily: 'inherit', cursor: 'pointer',
  };

  return (
    <AdminLayout>
      <style>{`@keyframes adm-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: 0 }}>
          {t('admin.orders')}
        </h1>
        {meta.total != null && (
          <span style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)' }}>
            {meta.total} {lang === 'ar' ? 'طلب' : 'orders'}
          </span>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">{t('admin.filter_all')}</option>
          {statusOptions.slice(1).map((s) => (
            <option key={s} value={s}>{t(`admin.filter_${s}`)}</option>
          ))}
        </select>

        <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">{lang === 'ar' ? 'كل الدفعات' : 'All payments'}</option>
          {paymentOptions.slice(1).map((s) => (
            <option key={s} value={s}>{t(`admin.filter_${s}`)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ height: '44px', borderRadius: '8px', background: 'var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
            {t('admin.no_orders')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                  {[t('admin.col_order'), t('admin.col_items'), t('admin.col_total'), t('admin.col_payment_method'), t('admin.col_payment_status'), t('admin.col_status'), t('admin.col_date'), t('admin.col_actions')].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'start', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
                  const pc = PAYMENT_COLORS[order.payment_status] ?? PAYMENT_COLORS.unpaid;
                  const nextStatuses = NEXT_STATUSES[order.status] ?? [];

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--theme-border)', background: idx % 2 === 0 ? 'var(--theme-surface)' : 'var(--theme-bg)' }}>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {order.order_number}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                        {order.item_count ?? '—'}
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
                        {nextStatuses.length > 0 ? (
                          <select
                            defaultValue=""
                            onChange={(e) => { if (e.target.value) handleStatusChange(order, e.target.value); }}
                            disabled={updateStatus.isPending}
                            style={{ ...selectStyle, padding: '5px 10px', fontSize: '0.8125rem' }}
                          >
                            <option value="" disabled>{t('admin.update_status')}</option>
                            {nextStatuses.map((s) => (
                              <option key={s} value={s}>{t(`admin.status_${s}`)}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-hint)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
