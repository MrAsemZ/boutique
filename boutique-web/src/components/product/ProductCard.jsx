import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import SaleBadge from '../common/SaleBadge';
import { useAuthStore } from '../../stores/authStore';
import { useAddToCart } from '../../hooks/api/useCart';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../../hooks/api/useWishlist';
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

export default function ProductCard({ product }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [hovered, setHovered] = useState(false);

  const { mutate: addToCart, isPending: cartLoading } = useAddToCart();
  const { data: wishlistData } = useWishlist();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  const cardRef = useRef(null);
  const isVisible = useIntersectionObserver(cardRef);

  const wishlistItems = Array.isArray(wishlistData)
    ? wishlistData
    : (wishlistData?.data ?? []);

  const wishlistItem = wishlistItems.find(
    (item) =>
      item.variant_id === product.variants?.[0]?.id ||
      item.product_id === product.id
  );
  const isInWishlist = !!wishlistItem;

  const imageUrl =
    product.primary_image_url ||
    FASHION_PLACEHOLDERS[(product.id ?? 0) % FASHION_PLACEHOLDERS.length];

  const displayPrice = product.sale_price ?? product.base_price;
  const discount = product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    addToCart(
      { product_id: product.id, quantity: 1 },
      {
        onSuccess: () => toast.success(isArabic ? 'تمت الإضافة للسلة' : 'Added to cart'),
        onError: (err) =>
          toast.error(err?.response?.data?.message || (isArabic ? 'حدث خطأ' : 'Failed to add')),
      }
    );
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (isInWishlist) {
      removeFromWishlist(wishlistItem.id ?? product.id);
    } else {
      addToWishlist({ product_id: product.id });
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/products/${product.slug}`)}
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
          alt={product.display_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {product.sale_price && <SaleBadge />}

        <button
          onClick={handleWishlist}
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
          {product.display_name}
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
          onClick={handleAddToCart}
          disabled={cartLoading}
          style={{
            width: '100%', padding: '10px', borderRadius: '50px',
            border: 'none',
            background: cartLoading ? 'var(--theme-border)' : 'var(--theme-accent)',
            color: cartLoading ? 'var(--theme-text-hint)' : 'var(--theme-bg)',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: cartLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {cartLoading
            ? (isArabic ? 'جارٍ...' : 'Adding...')
            : (isArabic ? 'أضف للسلة' : 'Add to Cart')}
        </button>
      </div>
    </div>
  );
}
