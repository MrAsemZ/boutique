import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import SaleBadge from '../common/SaleBadge';
import { useAuthStore } from '../../stores/authStore';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { formatPrice } from '../../utils/formatPrice';


const FASHION_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=500&fit=crop',
];

export default function ProductCard({ product, isInWishlist = false, onWishlistToggle = null }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [hovered, setHovered] = useState(false);

  const cardRef = useRef(null);
  const isVisible = useIntersectionObserver(cardRef);

  const productName = product.display_name ||
    (i18n.language === 'ar' ? product.name_ar : product.name) ||
    product.name;

  const imageUrl =
    product.primary_image_url ||
    FASHION_PLACEHOLDERS[(product.id ?? 0) % FASHION_PLACEHOLDERS.length];

  const displayPrice = product.sale_price ?? product.base_price;
  const discount = product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  const handleCardClick = () => navigate(`/products/${product.slug}`);

  const handleViewItem = (e) => {
    e.stopPropagation();
    navigate(`/products/${product.slug}`);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (onWishlistToggle) onWishlistToggle(product);
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--theme-surface)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--theme-border)',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? (hovered ? 'translateY(-4px)' : 'translateY(0)')
          : 'translateY(20px)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: 'var(--theme-border)' }}>
        <img
          src={imageUrl}
          alt={productName}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {product.sale_price && <SaleBadge />}

        <button
          onClick={handleWishlistClick}
          style={{
            position: 'absolute', top: '8px', insetInlineEnd: '8px',
            width: '32px', height: '32px', borderRadius: '50%',
            border: 'none', background: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0, flexShrink: 0,
          }}
        >
          {isInWishlist
            ? <HeartSolidIcon style={{ width: '18px', height: '18px', color: '#ef4444' }} />
            : <HeartIcon style={{ width: '18px', height: '18px', color: '#6b7280' }} />}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '12px' }}>
        <p style={{
          fontSize: '0.875rem', fontWeight: 500, color: 'var(--theme-text-primary)',
          margin: '0 0 4px', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {productName}
        </p>

        {product.brand_name && (
          <p style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary)', margin: '0 0 8px' }}>
            {product.brand_name}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{ fontWeight: 700, color: 'var(--theme-accent)', fontSize: '1rem' }}>
            {formatPrice(displayPrice, i18n.language)}
          </span>
          {product.sale_price && (
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--theme-text-hint)', textDecoration: 'line-through' }}>
                {formatPrice(product.base_price, i18n.language)}
              </span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700,
                background: 'var(--theme-badge-sale)', color: '#fff',
                padding: '2px 6px', borderRadius: '4px',
              }}>
                -{discount}%
              </span>
            </>
          )}
        </div>

        <button
          onClick={handleViewItem}
          style={{
            width: '100%', padding: '10px', borderRadius: '50px',
            border: '1.5px solid var(--theme-accent)',
            background: 'transparent',
            color: 'var(--theme-accent)',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--theme-accent)';
            e.currentTarget.style.color = 'var(--theme-surface)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--theme-accent)';
          }}
        >
          {t('product.view_item')}
        </button>
      </div>
    </div>
  );
}
