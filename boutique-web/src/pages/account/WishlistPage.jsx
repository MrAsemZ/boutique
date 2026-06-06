import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useWishlist, useRemoveFromWishlist } from '../../hooks/api/useWishlist';
import { useAddToCart } from '../../hooks/api/useCart';
import AccountLayout from '../../components/layout/AccountLayout';
import { formatPrice } from '../../utils/formatPrice';

const FASHION_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80',
];

function WishlistCard({ item, onRemove, onAddToCart }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const product = item.product ?? item;
  const variant = item.variant ?? null;

  const imageUrl = product.primary_image_url ?? FASHION_PLACEHOLDERS[item.id % FASHION_PLACEHOLDERS.length];
  const name = lang === 'ar'
    ? (product.display_name ?? product.name_ar ?? product.name)
    : (product.display_name ?? product.name ?? product.name_ar);

  const price = variant?.price ?? product.price ?? product.min_price ?? 0;
  const originalPrice = variant?.original_price ?? product.original_price ?? null;
  const isOnSale = originalPrice && originalPrice > price;

  return (
    <div style={{
      background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
      borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{ position: 'relative' }}>
        <Link to={`/products/${product.slug}`}>
          <img
            src={imageUrl}
            alt={name}
            style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.src = FASHION_PLACEHOLDERS[0]; }}
          />
        </Link>
        {isOnSale && (
          <span style={{
            position: 'absolute', top: '10px', insetInlineStart: '10px',
            background: 'var(--theme-badge-sale)', color: 'white',
            fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
          }}>
            SALE
          </span>
        )}
        <button
          onClick={onRemove}
          style={{
            position: 'absolute', top: '10px', insetInlineEnd: '10px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
          title={t('wishlist.remove')}
        >
          <svg viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="1.5" width="16" height="16">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--theme-text-primary)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {name}
          </div>
        </Link>

        {(variant?.size || variant?.color) && (
          <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary)', display: 'flex', gap: '8px' }}>
            {variant.size && <span>{t('wishlist.size')}: {variant.size}</span>}
            {variant.color && <span>{t('wishlist.color')}: {variant.color}</span>}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
          <span style={{ fontWeight: 700, color: 'var(--theme-accent)', fontSize: '0.9375rem' }}>
            {formatPrice(price, lang)}
          </span>
          {isOnSale && (
            <span style={{ fontSize: '0.8rem', color: 'var(--theme-text-hint)', textDecoration: 'line-through' }}>
              {formatPrice(originalPrice, lang)}
            </span>
          )}
        </div>

        <button
          onClick={onAddToCart}
          style={{
            width: '100%', padding: '10px', borderRadius: '50px',
            background: 'var(--theme-accent)', color: 'var(--theme-surface)',
            fontWeight: 600, fontSize: '0.8125rem', border: 'none', cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          {t('wishlist.add_to_cart')}
        </button>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  const items = data?.data?.items ?? data?.data ?? [];
  const hasSaleItems = items.some((item) => {
    const v = item.variant ?? null;
    const p = item.product ?? item;
    const price = v?.price ?? p.price ?? 0;
    const orig = v?.original_price ?? p.original_price ?? null;
    return orig && orig > price;
  });

  const handleRemove = (id) => {
    removeFromWishlist.mutate(id, {
      onError: () => toast.error(t('common.error')),
    });
  };

  const handleAddToCart = (item) => {
    const variantId = item.variant?.id ?? item.variant_id;
    const product = item.product ?? item;
    const variant = item.variant ?? null;
    if (!variantId) {
      toast.error(t('common.error'));
      return;
    }
    addToCart.mutate(
      { variant_id: variantId, quantity: 1, product, variant },
      { onSuccess: () => toast.success(t('wishlist.added_to_cart')) }
    );
  };

  return (
    <AccountLayout>
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '24px' }}>
        {t('wishlist.title')}
      </h1>

      {/* Sale banner */}
      {hasSaleItems && (
        <div style={{
          background: 'color-mix(in srgb, var(--theme-accent) 12%, transparent)',
          border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)',
          borderRadius: '12px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '20px',
          fontSize: '0.9rem', color: 'var(--theme-accent)', fontWeight: 500,
        }}>
          <span style={{ fontSize: '1.25rem' }}>🎉</span>
          {lang === 'ar' ? t('wishlist.on_sale_banner') : t('wishlist.on_sale_banner')}
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ borderRadius: '14px', background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', aspectRatio: '2/3', animation: 'pulse 1.4s ease infinite' }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🤍</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '8px' }}>
            {t('wishlist.empty')}
          </h2>
          <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '24px' }}>
            {t('wishlist.empty_sub')}
          </p>
          <Link
            to="/shop"
            style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: '50px',
              background: 'var(--theme-accent)', color: 'var(--theme-surface)',
              fontWeight: 600, textDecoration: 'none',
            }}
          >
            {t('wishlist.browse')}
          </Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={() => handleRemove(item.id)}
              onAddToCart={() => handleAddToCart(item)}
            />
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
