import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrders } from '../../hooks/api/useOrders';
import AccountLayout from '../../components/layout/AccountLayout';
import { formatPrice } from '../../utils/formatPrice';

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  shipped:   { bg: '#EDE9FE', text: '#5B21B6' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '50px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: colors.bg,
      color: colors.text,
    }}>
      {t(`orders.${status}`, status)}
    </span>
  );
}

function PaymentIcon({ method }) {
  if (method === 'cliq') {
    return (
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--theme-accent)', background: 'color-mix(in srgb, var(--theme-accent) 10%, transparent)', padding: '2px 8px', borderRadius: '6px' }}>
        CliQ
      </span>
    );
  }
  return (
    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--theme-text-secondary)' }}>
      💵 COD
    </span>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--theme-surface)',
      border: '1px solid var(--theme-border)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {[80, 60, 40].map((w, i) => (
        <div key={i} style={{
          height: '16px',
          width: `${w}%`,
          borderRadius: '8px',
          background: 'var(--theme-border)',
          animation: 'pulse 1.4s ease infinite',
        }} />
      ))}
    </div>
  );
}

export default function OrderHistoryPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useOrders(page);
  const orders = data?.data ?? [];
  const meta = data?.meta ?? null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <AccountLayout>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        .order-card {
          background: var(--theme-surface);
          border: 1px solid var(--theme-border);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: box-shadow 0.2s, border-color 0.2s;
          text-decoration: none;
          color: inherit;
        }
        .order-card:hover {
          box-shadow: 0 4px 20px color-mix(in srgb, var(--theme-accent) 10%, transparent);
          border-color: var(--theme-accent);
        }
        .order-thumb {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
          background: var(--theme-border);
        }
        .order-info { flex: 1; min-width: 0; }
        .order-number { font-weight: 700; font-size: 0.9375rem; color: var(--theme-text-primary); margin-bottom: 4px; }
        .order-meta { font-size: 0.8125rem; color: var(--theme-text-secondary); display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .order-total { font-weight: 700; font-size: 1rem; color: var(--theme-accent); white-space: nowrap; }
        .order-view-btn {
          padding: 8px 16px;
          border-radius: 50px;
          border: 1.5px solid var(--theme-border);
          background: none;
          color: var(--theme-text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
          text-decoration: none;
          display: inline-block;
        }
        .order-view-btn:hover { border-color: var(--theme-accent); color: var(--theme-accent); }
        @media (max-width: 600px) {
          .order-card { flex-wrap: wrap; }
          .order-view-btn { width: 100%; text-align: center; }
        }
      `}</style>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '24px' }}>
        {t('orders.title')}
      </h1>

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
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '8px' }}>
            {t('orders.empty')}
          </h2>
          <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '24px' }}>
            {t('orders.empty_sub')}
          </p>
          <Link
            to="/shop"
            style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: '50px',
              background: 'var(--theme-accent)', color: 'var(--theme-surface)',
              fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem',
            }}
          >
            {t('orders.start_shopping')}
          </Link>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => {
            const firstItem = order.items?.[0] ?? order.order_items?.[0];
            const imageUrl = firstItem?.product?.primary_image_url ?? null;
            const itemCount = order.items?.length ?? order.order_items?.length ?? order.item_count ?? 0;

            return (
              <div key={order.id} className="order-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '20px' }}>
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="order-thumb" />
                ) : (
                  <div className="order-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-text-hint)' }}>
                    📦
                  </div>
                )}

                <div className="order-info">
                  <div className="order-number">{order.order_number}</div>
                  <div className="order-meta">
                    <StatusBadge status={order.status} />
                    <span>·</span>
                    <span>{formatDate(order.created_at)}</span>
                    <span>·</span>
                    <PaymentIcon method={order.payment_method} />
                    <span>·</span>
                    <span>{t('orders.items', { count: itemCount })}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <div className="order-total">{formatPrice(order.total, lang)}</div>
                  <Link to={`/orders/${order.id}`} className="order-view-btn">
                    {t('orders.view_details')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px', borderRadius: '50px', border: '1.5px solid var(--theme-border)',
              background: 'none', color: 'var(--theme-text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.4 : 1,
            }}
          >
            {lang === 'ar' ? '›' : '‹'}
          </button>
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
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
            style={{
              padding: '8px 16px', borderRadius: '50px', border: '1.5px solid var(--theme-border)',
              background: 'none', color: 'var(--theme-text-secondary)', cursor: page === meta.last_page ? 'not-allowed' : 'pointer',
              opacity: page === meta.last_page ? 0.4 : 1,
            }}
          >
            {lang === 'ar' ? '‹' : '›'}
          </button>
        </div>
      )}
    </AccountLayout>
  );
}
