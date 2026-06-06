import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useOrder, useCancelOrder } from '../../hooks/api/useOrders';
import AccountLayout from '../../components/layout/AccountLayout';
import { formatPrice } from '../../utils/formatPrice';

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  shipped:   { bg: '#EDE9FE', text: '#5B21B6' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const TIMELINE_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
const STEP_ORDER = { pending: 0, confirmed: 1, shipped: 2, delivered: 3, cancelled: -1 };

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 14px', borderRadius: '50px',
      fontSize: '0.8125rem', fontWeight: 600, background: colors.bg, color: colors.text,
    }}>
      {t(`orders.${status}`, status)}
    </span>
  );
}

function Timeline({ status }) {
  const { t } = useTranslation();
  const currentIdx = STEP_ORDER[status] ?? 0;
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0', flexWrap: 'wrap' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: '#FEE2E2', border: '2px solid #EF4444',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <span style={{ fontWeight: 600, color: '#EF4444' }}>{t('orders.cancelled')}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '20px 0', overflowX: 'auto' }}>
      {TIMELINE_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < TIMELINE_STEPS.length - 1 ? 1 : 'none', minWidth: idx < TIMELINE_STEPS.length - 1 ? '80px' : 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: done ? 'var(--theme-accent)' : 'var(--theme-surface)',
                border: `2px solid ${done ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: active ? '0 0 0 4px color-mix(in srgb, var(--theme-accent) 20%, transparent)' : 'none',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}>
                {done && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--theme-surface)" strokeWidth="3" width="14" height="14">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span style={{
                fontSize: '0.6875rem', fontWeight: active ? 700 : 500,
                color: done ? 'var(--theme-accent)' : 'var(--theme-text-hint)',
                whiteSpace: 'nowrap',
              }}>
                {t(`orders.timeline_${step}`)}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '2px', margin: '0 4px', marginBottom: '22px',
                background: done ? 'var(--theme-accent)' : 'var(--theme-border)',
                borderRadius: '2px',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
      borderRadius: '14px', padding: '20px', marginBottom: '16px',
    }}>
      {title && (
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '16px' }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data, isLoading, isError } = useOrder(id);
  const cancelOrder = useCancelOrder();

  const order = data?.data ?? null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const handleCancel = () => {
    cancelOrder.mutate(id, {
      onSuccess: () => {
        toast.success(t('orders.cancel_success'));
        setShowCancelDialog(false);
      },
      onError: () => {
        toast.error(t('common.error'));
        setShowCancelDialog(false);
      },
    });
  };

  const displayName = (item) => {
    const p = item.product ?? item;
    return lang === 'ar' ? (p.display_name ?? p.name_ar ?? p.name) : (p.display_name ?? p.name ?? p.name_ar);
  };

  if (isLoading) {
    return (
      <AccountLayout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[120, 200, 160].map((h, i) => (
            <div key={i} style={{
              height: `${h}px`, borderRadius: '14px',
              background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
              animation: 'pulse 1.4s ease infinite',
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
      </AccountLayout>
    );
  }

  if (isError || !order) {
    return (
      <AccountLayout>
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--theme-text-secondary)' }}>
          {t('common.error')}
        </div>
      </AccountLayout>
    );
  }

  const items = order.items ?? order.order_items ?? [];
  const addr = order.address ?? order.delivery_address ?? null;
  const shipping = order.shipping_fee ?? order.shipping ?? 0;
  const discount = order.discount ?? order.voucher_discount ?? 0;

  return (
    <AccountLayout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
            {order.order_number}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <StatusBadge status={order.status} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
              {formatDate(order.created_at)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
            {order.payment_method === 'cliq' ? t('orders.payment_cliq') : t('orders.payment_cod')}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <Section>
        <Timeline status={order.status} />
      </Section>

      {/* Items */}
      <Section title={t('orders.order_number') + ' — ' + t('orders.items', { count: items.length })}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, idx) => (
            <div key={item.id ?? idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {item.product?.primary_image_url ? (
                <img
                  src={item.product.primary_image_url}
                  alt=""
                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, background: 'var(--theme-border)' }}
                />
              ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--theme-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  📦
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--theme-text-primary)', marginBottom: '2px' }}>
                  {displayName(item)}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
                  {item.variant?.size && <span>{t('product.size')}: {item.variant.size}</span>}
                  {item.variant?.color && <span style={{ marginInlineStart: '8px' }}>{t('product.color')}: {item.variant.color}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'end', flexShrink: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--theme-text-primary)' }}>
                  {formatPrice(item.line_total ?? item.unit_price * item.quantity, lang)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary)' }}>
                  {item.quantity} × {formatPrice(item.unit_price, lang)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Summary */}
      <Section title={t('cart.order_total')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: t('orders.subtotal'), value: formatPrice(order.subtotal, lang) },
            { label: t('orders.shipping'), value: shipping > 0 ? formatPrice(shipping, lang) : t('cart.free') },
            ...(discount > 0 ? [{ label: t('orders.discount'), value: '−' + formatPrice(discount, lang), accent: true }] : []),
            { label: t('orders.total'), value: formatPrice(order.total, lang), bold: true },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: row.bold ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)', fontWeight: row.bold ? 700 : 400 }}>
                {row.label}
              </span>
              <span style={{ fontSize: row.bold ? '1.0625rem' : '0.9rem', fontWeight: row.bold ? 700 : 500, color: row.accent ? 'var(--theme-success)' : row.bold ? 'var(--theme-accent)' : 'var(--theme-text-primary)' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Delivery Address */}
      {addr && (
        <Section title={t('orders.delivery_address')}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--theme-accent)" strokeWidth="2" width="20" height="20" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              {addr.label && (
                <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: 'color-mix(in srgb, var(--theme-accent) 10%, transparent)', color: 'var(--theme-accent)', marginBottom: '6px' }}>
                  {t(`addresses.${addr.label}`, addr.label)}
                </span>
              )}
              <div style={{ fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '2px' }}>{addr.full_name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)', lineHeight: 1.6 }}>
                {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                {addr.city}{addr.country ? `, ${addr.country}` : ''}<br />
                {addr.phone}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Notes */}
      {order.notes && (
        <Section title={t('orders.notes')}>
          <p style={{ fontSize: '0.9rem', color: 'var(--theme-text-secondary)', margin: 0 }}>{order.notes}</p>
        </Section>
      )}

      {/* Cancel button */}
      {order.status === 'pending' && (
        <div style={{ marginTop: '8px' }}>
          <button
            onClick={() => setShowCancelDialog(true)}
            style={{
              padding: '12px 24px', borderRadius: '50px',
              border: '1.5px solid #EF4444', background: 'none',
              color: '#EF4444', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            {t('orders.cancel_order')}
          </button>
        </div>
      )}

      {/* Cancel confirm dialog */}
      {showCancelDialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: 'var(--theme-surface)', borderRadius: '16px', padding: '28px',
            maxWidth: '360px', width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '8px' }}>
              {t('orders.cancel_order')}
            </h3>
            <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              {t('orders.cancel_confirm')}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowCancelDialog(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '50px',
                  border: '1.5px solid var(--theme-border)', background: 'none',
                  color: 'var(--theme-text-secondary)', fontWeight: 500, cursor: 'pointer',
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelOrder.isPending}
                style={{
                  flex: 1, padding: '12px', borderRadius: '50px',
                  border: 'none', background: '#EF4444',
                  color: 'white', fontWeight: 600, cursor: 'pointer',
                  opacity: cancelOrder.isPending ? 0.7 : 1,
                }}
              >
                {cancelOrder.isPending ? '...' : t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
