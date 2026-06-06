import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice } from '../../utils/formatPrice';

const SUCCESS_STYLES = `
  @keyframes check-pop {
    0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(5deg);  opacity: 1; }
    100% { transform: scale(1) rotate(0deg);    opacity: 1; }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .success-check {
    animation: check-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--theme-accent) 15%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }
  .success-content {
    animation: fade-up 0.5s 0.3s ease both;
  }
`;

export default function OrderSuccessPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const lang = i18n.language;

  const orderNumber = searchParams.get('order') ?? '';
  const orderId = searchParams.get('id') ?? '';

  useEffect(() => {
    useCartStore.getState().clearCart();
  }, []);

  return (
    <div style={{ background: 'var(--theme-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <style>{SUCCESS_STYLES}</style>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>

        <div className="success-check">
          <svg viewBox="0 0 48 48" fill="none" style={{ width: '52px', height: '52px' }}>
            <circle cx="24" cy="24" r="22" stroke="var(--theme-accent)" strokeWidth="3" fill="none" />
            <path d="M14 24l7 7 13-13" stroke="var(--theme-accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="success-content">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '8px' }}>
            {t('orders.success_title')}
          </h1>

          {orderNumber && (
            <div style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: '10px',
              background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
              marginBottom: '16px',
            }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
                {t('orders.order_number')}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--theme-accent)', letterSpacing: '0.05em' }}>
                {orderNumber}
              </p>
            </div>
          )}

          <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '8px', fontSize: '0.9375rem' }}>
            {lang === 'ar'
              ? 'سيصلك الطلب خلال'
              : 'Estimated delivery in'}{' '}
            <strong style={{ color: 'var(--theme-text-primary)' }}>{t('orders.estimated')}</strong>
          </p>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: '10px',
            marginTop: '28px', maxWidth: '320px', margin: '28px auto 0',
          }}>
            {orderId && (
              <Link
                to={`/orders/${orderId}`}
                style={{
                  display: 'block', padding: '14px', borderRadius: '50px',
                  background: 'var(--theme-accent)', color: 'var(--theme-surface)',
                  fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                {t('orders.track')}
              </Link>
            )}
            <Link
              to="/shop"
              style={{
                display: 'block', padding: '14px', borderRadius: '50px',
                border: '1.5px solid var(--theme-border)', background: 'none',
                color: 'var(--theme-text-secondary)', fontWeight: 500, fontSize: '0.9375rem',
                textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              {t('orders.continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
