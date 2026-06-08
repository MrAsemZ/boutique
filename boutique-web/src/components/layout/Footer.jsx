import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TRUST_BADGES = [
  { ar: '🚚 توصيل سريع', en: '🚚 Fast Delivery' },
  { ar: '🔒 دفع آمن', en: '🔒 Secure Payment' },
  { ar: '↩️ إرجاع سهل', en: '↩️ Easy Returns' },
  { ar: '💬 دعم 24/7', en: '💬 24/7 Support' },
];

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <footer
      style={{
        background: 'var(--theme-surface)',
        borderTop: '1px solid var(--theme-border)',
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
        marginTop: 'auto',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Trust badges */}
        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '16px 0',
          borderTop: '1px solid var(--theme-border)',
          borderBottom: '1px solid var(--theme-border)',
          marginBottom: '24px',
        }}>
          {TRUST_BADGES.map((badge) => (
            <span key={badge.en} style={{
              fontSize: '13px',
              color: 'var(--theme-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              {isArabic ? badge.ar : badge.en}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <p style={{ color: 'var(--theme-text-primary)', fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
              Boutique
            </p>
            <p style={{ color: 'var(--theme-text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
              بوتيك
            </p>
          </div>

          {/* Quick links */}
          <div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/shop" style={{ color: 'var(--theme-text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>
                  {t('nav.shop')}
                </Link>
              </li>
              <li>
                <Link to="/orders" style={{ color: 'var(--theme-text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>
                  {t('nav.orders')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment methods */}
          <div>
            <p style={{ color: 'var(--theme-text-hint)', fontSize: '0.75rem', margin: 0 }}>
              {t('checkout.cod')} · {t('checkout.cliq')}
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid var(--theme-border)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
            {['Instagram', 'Facebook', 'TikTok'].map((social) => (
              <a key={social} href="#" style={{
                fontSize: '13px',
                color: 'var(--theme-text-secondary)',
                textDecoration: 'none',
              }}>{social}</a>
            ))}
          </div>
          <p style={{ color: 'var(--theme-text-hint)', fontSize: '0.75rem', margin: 0 }}>
            © {new Date().getFullYear()} Boutique · بوتيك. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
