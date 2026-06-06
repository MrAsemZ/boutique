import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useVendorOrders, useUpdateVendorOrderStatus } from '../../hooks/api/useVendor';
import VendorLayout from '../../components/layout/VendorLayout';
import { formatPrice } from '../../utils/formatPrice';

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  shipped:   { bg: '#EDE9FE', text: '#5B21B6' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const TABS = ['', 'pending', 'confirmed', 'shipped', 'delivered'];

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.text }}>
      {t(`orders.${status}`, status)}
    </span>
  );
}

function OrderCard({ order, onAction }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const updateStatus = useUpdateVendorOrderStatus();

  const items = order.items ?? order.order_items ?? [];
  const canConfirm = order.status === 'pending';
  const canShip = order.status === 'confirmed';

  const handleAction = () => {
    const nextStatus = canConfirm ? 'confirmed' : 'shipped';
    updateStatus.mutate({ id: order.id, status: nextStatus }, {
      onSuccess: () => toast.success(lang === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated'),
      onError: () => toast.error(t('common.error')),
    });
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  const displayName = (item) => {
    const p = item.product ?? item;
    return lang === 'ar' ? (p.display_name ?? p.name_ar ?? p.name) : (p.display_name ?? p.name ?? p.name_ar);
  };

  return (
    <div style={{
      background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
      borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--theme-text-primary)', marginBottom: '4px' }}>
            {order.order_number}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={order.status} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
              {formatDate(order.created_at)}
            </span>
            {order.user?.name && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
                · {order.user.name}
              </span>
            )}
          </div>
        </div>

        {(canConfirm || canShip) && (
          <button
            onClick={handleAction}
            disabled={updateStatus.isPending}
            style={{
              padding: '9px 18px', borderRadius: '50px',
              background: 'var(--theme-accent)', color: 'var(--theme-surface)',
              fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer',
              opacity: updateStatus.isPending ? 0.7 : 1, flexShrink: 0,
            }}
          >
            {updateStatus.isPending ? '...' : (canConfirm ? t('vendor.confirm_order') : t('vendor.mark_shipped'))}
          </button>
        )}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, idx) => (
          <div key={item.id ?? idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {item.product?.primary_image_url ? (
              <img src={item.product.primary_image_url} alt="" style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, background: 'var(--theme-border)' }} />
            ) : (
              <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: 'var(--theme-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                📦
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--theme-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName(item)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary)' }}>
                {item.variant?.size && <span>{t('product.size')}: {item.variant.size}</span>}
                {item.variant?.color && <span style={{ marginInlineStart: '8px' }}>{t('product.color')}: {item.variant.color}</span>}
                <span style={{ marginInlineStart: '8px' }}>× {item.quantity}</span>
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--theme-accent)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {formatPrice(item.line_total ?? item.unit_price * item.quantity, lang)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer total */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--theme-border)' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)', marginInlineEnd: '8px' }}>
          {t('orders.total')}:
        </span>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--theme-accent)' }}>
          {formatPrice(order.vendor_total ?? order.total, lang)}
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[80, 60, 40].map((w, i) => (
        <div key={i} style={{ height: '16px', width: `${w}%`, borderRadius: '8px', background: 'var(--theme-border)', animation: 'pulse 1.4s ease infinite' }} />
      ))}
    </div>
  );
}

export default function VendorOrdersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useVendorOrders(page, activeTab);
  const orders = data?.data ?? [];
  const meta = data?.meta ?? null;

  const TAB_LABELS = {
    '':          t('vendor.tab_all'),
    pending:     t('vendor.tab_pending'),
    confirmed:   t('vendor.tab_confirmed'),
    shipped:     t('vendor.tab_shipped'),
    delivered:   t('vendor.tab_delivered'),
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <VendorLayout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '20px' }}>
        {t('vendor.orders')}
      </h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: '8px 16px', borderRadius: '50px', fontSize: '0.875rem',
              fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer',
              border: `1.5px solid ${activeTab === tab ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
              background: activeTab === tab ? 'color-mix(in srgb, var(--theme-accent) 12%, transparent)' : 'none',
              color: activeTab === tab ? 'var(--theme-accent)' : 'var(--theme-text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {isError && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--theme-text-secondary)' }}>
          {t('common.error')}
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
          <p style={{ color: 'var(--theme-text-secondary)', fontSize: '1rem' }}>
            {lang === 'ar' ? 'لا توجد طلبات في هذه الفئة' : 'No orders in this category'}
          </p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: '50px', border: '1.5px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
          >
            {lang === 'ar' ? '›' : '‹'}
          </button>
          {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: '8px 14px', borderRadius: '50px',
                border: `1.5px solid ${p === page ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                background: p === page ? 'var(--theme-accent)' : 'none',
                color: p === page ? 'var(--theme-surface)' : 'var(--theme-text-secondary)',
                cursor: 'pointer', fontWeight: p === page ? 600 : 400,
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            style={{ padding: '8px 16px', borderRadius: '50px', border: '1.5px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', cursor: page === meta.last_page ? 'not-allowed' : 'pointer', opacity: page === meta.last_page ? 0.4 : 1 }}
          >
            {lang === 'ar' ? '‹' : '›'}
          </button>
        </div>
      )}
    </VendorLayout>
  );
}
