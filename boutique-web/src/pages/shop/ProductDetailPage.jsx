import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HeartIcon, ShareIcon, ChevronDownIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { useProduct, useProducts } from '../../hooks/api/useProducts';
import { useAddToCart } from '../../hooks/api/useCart';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../../hooks/api/useWishlist';
import { useAuthStore } from '../../stores/authStore';
import { formatPrice } from '../../utils/formatPrice';
import ProductCard from '../../components/product/ProductCard';
import SectionWrapper from '../../components/common/SectionWrapper';

// ── CSS ──────────────────────────────────────────────────────────────────────

const PD_STYLES = `
  .pd-layout {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 48px;
    align-items: start;
  }
  .pd-thumb-strip {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    overflow-x: auto;
    flex-wrap: wrap;
    scrollbar-width: none;
  }
  .pd-thumb-strip::-webkit-scrollbar { display: none; }
  .pd-related-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  .pd-main-actions { display: flex; flex-direction: column; gap: 12px; }
  .pd-sticky-cart {
    display: none;
    position: fixed;
    bottom: 0;
    inset-inline-start: 0;
    inset-inline-end: 0;
    background: var(--theme-surface);
    border-top: 1px solid var(--theme-border);
    padding: 12px 20px;
    z-index: 50;
  }
  @media (max-width: 767px) {
    .pd-layout            { grid-template-columns: 1fr; gap: 24px; }
    .pd-related-grid      { grid-template-columns: repeat(2, 1fr); }
    .pd-main-actions      { display: none; }
    .pd-sticky-cart       { display: block; }
  }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function findVariant(variants, size, color) {
  if (!size && !color) return variants[0] ?? null;
  return variants.find(v =>
    (size  ? v.size  === size  : true) &&
    (color ? v.color === color : true)
  ) ?? null;
}

function productName(p, isArabic) {
  return p?.display_name || (isArabic ? p?.name_ar : p?.name) || p?.name || '';
}

function categoryName(cat, isArabic) {
  return cat?.display_name || (isArabic ? cat?.name_ar : cat?.name_en) || cat?.name || '';
}

const LABEL = {
  fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'var(--theme-text-secondary)', margin: '0 0 8px',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="pd-layout" style={{ animation: 'skeleton-pulse 1.5s ease-in-out infinite' }}>
      <div>
        <div style={{ aspectRatio: '3/4', borderRadius: '12px', background: 'var(--theme-border)' }} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: '72px', height: '72px', borderRadius: '8px', background: 'var(--theme-border)', flexShrink: 0 }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '16px', background: 'var(--theme-border)', borderRadius: '6px', width: '35%' }} />
        <div style={{ height: '32px', background: 'var(--theme-border)', borderRadius: '6px', width: '80%' }} />
        <div style={{ height: '36px', background: 'var(--theme-border)', borderRadius: '6px', width: '28%' }} />
        <div style={{ height: '80px', background: 'var(--theme-border)', borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: '38px', width: '64px', background: 'var(--theme-border)', borderRadius: '50px' }} />
          ))}
        </div>
        <div style={{ height: '52px', background: 'var(--theme-border)', borderRadius: '50px' }} />
        <div style={{ height: '52px', background: 'var(--theme-border)', borderRadius: '50px' }} />
      </div>
    </div>
  );
}

function Breadcrumb({ product, isArabic }) {
  const cat = product?.category;
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--theme-text-hint)', marginBottom: '24px', flexWrap: 'wrap' }}>
      <Link to="/"     style={{ color: 'var(--theme-text-hint)', textDecoration: 'none' }}>{isArabic ? 'الرئيسية' : 'Home'}</Link>
      <ChevronRightIcon style={{ width: '11px', height: '11px', flexShrink: 0 }} />
      <Link to="/shop" style={{ color: 'var(--theme-text-hint)', textDecoration: 'none' }}>{isArabic ? 'المتجر' : 'Shop'}</Link>
      {cat?.slug && (
        <>
          <ChevronRightIcon style={{ width: '11px', height: '11px', flexShrink: 0 }} />
          <Link to={`/shop/${cat.slug}`} style={{ color: 'var(--theme-text-hint)', textDecoration: 'none' }}>
            {categoryName(cat, isArabic)}
          </Link>
        </>
      )}
      <ChevronRightIcon style={{ width: '11px', height: '11px', flexShrink: 0 }} />
      <span style={{ color: 'var(--theme-text-primary)', fontWeight: 500 }}>{productName(product, isArabic)}</span>
    </nav>
  );
}

function ImageGallery({ images, mainIdx, onThumbClick }) {
  const [hovered, setHovered] = useState(false);
  const main = images[mainIdx] ?? null;

  return (
    <div>
      {/* Main image */}
      <div
        style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', background: 'var(--theme-surface)', position: 'relative' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {main ? (
          <img
            src={main} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, var(--theme-surface), var(--theme-border))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '5rem', opacity: 0.2 }}>👗</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="pd-thumb-strip">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={i} onClick={() => onThumbClick(i)}
              style={{
                width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0,
                border: `2px solid ${i === mainIdx ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                padding: 0, cursor: 'pointer', background: 'none', transition: 'border-color 0.15s',
              }}
            >
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StockIndicator({ stock, isArabic }) {
  if (stock === null || stock === undefined) return null;
  if (stock === 0) return (
    <span style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 500 }}>✗ {isArabic ? 'غير متوفر' : 'Out of Stock'}</span>
  );
  if (stock <= 10) return (
    <span style={{ color: '#F59E0B', fontSize: '0.875rem', fontWeight: 500 }}>⚠ {isArabic ? `آخر ${stock} قطع` : `Only ${stock} left`}</span>
  );
  return (
    <span style={{ color: 'var(--theme-success)', fontSize: '0.875rem', fontWeight: 500 }}>✓ {isArabic ? 'متوفر' : 'In Stock'}</span>
  );
}

const COLOR_MAP = {
  black: '#1a1a1a', white: '#f5f5f5', navy: '#1B2A4A', gray: '#9CA3AF',
  grey: '#9CA3AF', red: '#EF4444', blue: '#3B82F6', green: '#10B981',
  brown: '#92400E', beige: '#D4B483', rose: '#FDA4AF', pink: '#F9A8D4',
  yellow: '#FCD34D', orange: '#FB923C', purple: '#A855F7', indigo: '#6366F1',
  denim: '#1560BD', cream: '#FFFDD0', khaki: '#C3B091', olive: '#6B7C3D',
  maroon: '#800000', teal: '#008080', coral: '#FF6B6B',
};

const getColorHex = (colorName) => {
  if (!colorName) return '#9CA3AF';
  return COLOR_MAP[colorName.toLowerCase().trim()] ?? '#9CA3AF';
};

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];


function QuantitySelector({ quantity, max, onInc, onDec }) {
  const btnStyle = (disabled) => ({
    padding: '0 18px', height: '100%', border: 'none', background: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', color: 'var(--theme-accent)',
    fontSize: '1.25rem', fontWeight: 700, opacity: disabled ? 0.35 : 1,
  });
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', height: '44px', border: '1.5px solid var(--theme-border)', borderRadius: '50px', overflow: 'hidden' }}>
      <button type="button" onClick={onDec} disabled={quantity <= 1}  style={btnStyle(quantity <= 1)}>−</button>
      <span style={{ minWidth: '40px', textAlign: 'center', color: 'var(--theme-text-primary)', fontWeight: 600, fontSize: '1rem' }}>{quantity}</span>
      <button type="button" onClick={onInc} disabled={quantity >= max} style={btnStyle(quantity >= max)}>+</button>
    </div>
  );
}

function ProductDetailsSection({ product, selectedVariant, isArabic }) {
  const [open, setOpen] = useState(false);
  const rows = [
    [isArabic ? 'الفئة' : 'Category',       categoryName(product?.category, isArabic)],
    [isArabic ? 'العلامة التجارية' : 'Brand', product?.brand_name || product?.brand?.name],
    [isArabic ? 'الخامة' : 'Material',       selectedVariant?.material || product?.material],
    ['SKU',                                   selectedVariant?.sku || product?.sku],
  ].filter(([, v]) => v);

  if (!rows.length) return null;

  return (
    <div style={{ borderTop: '1px solid var(--theme-border)', paddingTop: '16px' }}>
      <button
        type="button" onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', padding: '0 0 12px' }}
      >
        <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--theme-text-primary)' }}>
          {isArabic ? 'تفاصيل المنتج' : 'Product Details'}
        </span>
        <ChevronDownIcon style={{ width: '15px', height: '15px', color: 'var(--theme-text-hint)', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 20px' }}>
          {rows.map(([label, value]) => (
            <Fragment key={label}>
              <dt style={{ color: 'var(--theme-text-secondary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{label}</dt>
              <dd style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem', color: 'var(--theme-text-primary)' }}>{value}</dd>
            </Fragment>
          ))}
        </dl>
      )}
    </div>
  );
}

function NotFoundState({ isArabic, is404 }) {
  return (
    <div style={{ textAlign: 'center', padding: '100px 24px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.35 }}>{is404 ? '📦' : '⚠'}</div>
      <h2 style={{ margin: '0 0 8px', fontSize: '1.375rem', fontWeight: 600, color: 'var(--theme-text-primary)' }}>
        {is404
          ? (isArabic ? 'المنتج غير موجود' : 'Product not found')
          : (isArabic ? 'حدث خطأ' : 'Something went wrong')}
      </h2>
      <p style={{ margin: '0 0 28px', color: 'var(--theme-text-secondary)', fontSize: '0.9375rem' }}>
        {is404
          ? (isArabic ? 'تعذر العثور على هذا المنتج' : 'This product could not be found')
          : (isArabic ? 'تعذر تحميل المنتج' : 'Unable to load this product')}
      </p>
      <Link to="/shop" style={{ display: 'inline-block', padding: '12px 32px', borderRadius: '50px', background: 'var(--theme-accent)', color: 'var(--theme-bg)', textDecoration: 'none', fontWeight: 500 }}>
        {isArabic ? 'العودة إلى المتجر' : 'Back to Shop'}
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { i18n }  = useTranslation();
  const isArabic  = i18n.language === 'ar';
  const { isAuthenticated } = useAuthStore();
  const { setThemeForCategory } = useTheme();

  const [selectedSize,   setSelectedSize]   = useState(null);
  const [selectedColor,  setSelectedColor]  = useState(null);
  const [quantity,       setQuantity]       = useState(1);
  const [mainImageIdx,   setMainImageIdx]   = useState(0);
  const [descExpanded,   setDescExpanded]   = useState(false);
  const [prevSlug,       setPrevSlug]       = useState(slug);

  // Reset all selections when navigating to a different product (during render, not in an effect)
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setSelectedSize(null);
    setSelectedColor(null);
    setQuantity(1);
    setMainImageIdx(0);
  }

  // ── Data fetching ────────────────────────────────────────────────────────
  const { data: rawProduct, isLoading, isError, error } = useProduct(slug);
  const product = rawProduct?.id ? rawProduct : (rawProduct?.data ?? null);

  const catSlug = product?.category?.slug || product?.category_slug || null;
  const { data: relatedRaw } = useProducts(
    { category: catSlug, per_page: 5 },
    { enabled: !!catSlug }
  );
  const relatedAll = Array.isArray(relatedRaw) ? relatedRaw : (relatedRaw?.data ?? []);
  const relatedProducts = relatedAll.filter(p => p.id !== product?.id).slice(0, 4);

  const { data: wishlistData } = useWishlist();
  const { mutate: addToCart,      isPending: cartLoading }  = useAddToCart();
  const { mutate: addToWishlist }    = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  // ── Derived state ────────────────────────────────────────────────────────
  const variants = product?.variants ||
    (product?.variants_grouped
      ? Object.entries(product.variants_grouped).flatMap(([size, vs]) =>
          vs.map(v => ({ ...v, size }))
        )
      : []);

  const availableSizes = [...new Set(variants.map(v => v.size).filter(Boolean))]
    .sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));

  const availableColors = selectedSize
    ? [...new Set(variants.filter(v => v.size === selectedSize).map(v => v.color).filter(Boolean))]
    : [...new Set(variants.map(v => v.color).filter(Boolean))];

  const selectedVariant = findVariant(variants, selectedSize, selectedColor);
  const stock = selectedVariant?.stock ?? product?.stock ?? null;
  const isOutOfStock = stock === 0;

  const effectivePrice = selectedVariant?.price_override ?? product?.sale_price ?? product?.base_price ?? 0;
  const showDiscount = product?.sale_price && !selectedVariant?.price_override;
  const discountPct = showDiscount
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  const baseImages = [product?.primary_image_url, ...(product?.images ?? []), ...(product?.gallery_images ?? [])].filter(Boolean);
  const images = [...new Set(baseImages)];

  const variantImageIdx = selectedVariant?.image_url ? images.indexOf(selectedVariant.image_url) : -1;
  const displayImageIdx = variantImageIdx !== -1 ? variantImageIdx : mainImageIdx;

  const wishlistItems = Array.isArray(wishlistData) ? wishlistData : (wishlistData?.data ?? []);
  const wishlistItem  = wishlistItems.find(w => w.variant_id === selectedVariant?.id || w.product_id === product?.id);
  const isInWishlist  = !!wishlistItem;

  const wishlistVariantIds = new Set(wishlistItems.map(i => i.variant_id).filter(Boolean));
  const handleRelatedWishlistToggle = (relatedProduct) => {
    const variantId = relatedProduct.variants?.[0]?.id;
    if (!variantId) return;
    const isIn = wishlistVariantIds.has(variantId);
    if (isIn) {
      const wItem = wishlistItems.find(i => i.variant_id === variantId);
      if (wItem) removeFromWishlist(wItem.id);
    } else {
      addToWishlist({ product_variant_id: variantId });
    }
  };

  const pName = productName(product, isArabic);
  const pDesc = product?.display_description || (isArabic ? product?.description_ar : product?.description) || product?.description || '';

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!product) return;
    if (catSlug) setThemeForCategory(catSlug);
    document.title = `${pName} | Boutique`;
    return () => { document.title = 'Boutique'; };
  }, [product?.id, catSlug, pName, setThemeForCategory]);


  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const colors = variants.filter(v => v.size === size).map(v => v.color).filter(Boolean);
    if (colors.length && !colors.includes(selectedColor)) setSelectedColor(colors[0]);
    setQuantity(1);
  };

  const handleColorChange = (color) => { setSelectedColor(color); setQuantity(1); };

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const payload = selectedVariant
      ? { variant_id: selectedVariant.id, quantity }
      : { product_id: product.id, quantity };
    addToCart(payload, {
      onSuccess: () => toast.success(isArabic ? 'تمت الإضافة إلى السلة' : 'Added to cart'),
      onError:  (err) => toast.error(err?.response?.data?.message || (isArabic ? 'حدث خطأ' : 'Failed to add')),
    });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (isInWishlist) removeFromWishlist(wishlistItem.id ?? product.id);
    else              addToWishlist({ product_id: product.id });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(isArabic ? 'تم نسخ الرابط' : 'Link copied!');
    } catch {
      toast.error(isArabic ? 'تعذر نسخ الرابط' : 'Could not copy link');
    }
  };

  // ── Shared button styles ─────────────────────────────────────────────────
  const primaryBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', height: '52px', borderRadius: '50px', border: 'none',
    background: (isOutOfStock || cartLoading) ? 'var(--theme-border)' : 'var(--theme-accent)',
    color:      (isOutOfStock || cartLoading) ? 'var(--theme-text-hint)' : 'var(--theme-surface)',
    fontSize: '1rem', fontWeight: 500,
    cursor: (isOutOfStock || cartLoading) ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
  };

  const secondaryBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', height: '52px', borderRadius: '50px',
    border: '1.5px solid var(--theme-accent)', background: 'transparent',
    color: 'var(--theme-accent)', fontSize: '1rem', fontWeight: 500,
    cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'inherit',
  };

  const primaryLabel = isOutOfStock
    ? (isArabic ? 'غير متوفر' : 'Out of Stock')
    : cartLoading
      ? (isArabic ? 'جارٍ...' : 'Adding...')
      : (isArabic ? 'أضف إلى السلة' : 'Add to Cart');

  // ── Render ────────────────────────────────────────────────────────────────
  const is404 = error?.response?.status === 404;

  return (
    <div style={{ background: 'var(--theme-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <style>{PD_STYLES}</style>

      {isLoading && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          <ProductDetailSkeleton />
        </div>
      )}

      {isError && !isLoading && <NotFoundState isArabic={isArabic} is404={is404} />}

      {product && (
        <>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
            <Breadcrumb product={product} isArabic={isArabic} />

            <div className="pd-layout">
              {/* ── Left: gallery ─────────────────────────── */}
              <ImageGallery images={images} mainIdx={displayImageIdx} onThumbClick={setMainImageIdx} />

              {/* ── Right: info ───────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Vendor badge */}
                {product.vendor?.store_name && (
                  <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: '50px', alignSelf: 'flex-start',
                    border: '1px solid var(--theme-accent)', color: 'var(--theme-text-secondary)',
                    fontSize: '0.8125rem',
                  }}>
                    {product.vendor.store_name}
                  </span>
                )}

                {/* Name + share */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h1 style={{ margin: 0, fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 500, color: 'var(--theme-text-primary)', lineHeight: 1.3 }}>
                    {pName}
                  </h1>
                  <button onClick={handleShare} title={isArabic ? 'نسخ الرابط' : 'Copy link'} style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--theme-text-hint)', flexShrink: 0 }}>
                    <ShareIcon style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--theme-accent)' }}>
                    {formatPrice(effectivePrice, i18n.language)}
                  </span>
                  {showDiscount && (
                    <>
                      <span style={{ fontSize: '1.125rem', color: 'var(--theme-text-hint)', textDecoration: 'line-through' }}>
                        {formatPrice(product.base_price, i18n.language)}
                      </span>
                      <span style={{ background: 'var(--theme-badge-sale)', color: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {discountPct}% {isArabic ? 'خصم' : 'OFF'}
                      </span>
                    </>
                  )}
                </div>

                {/* Stock */}
                <StockIndicator stock={stock} isArabic={isArabic} />

                <div style={{ height: '1px', background: 'var(--theme-border)' }} />

                {/* Description */}
                {pDesc && (
                  <div>
                    <p style={LABEL}>{isArabic ? 'الوصف' : 'Description'}</p>
                    <div style={{
                      overflow: 'hidden',
                      ...(descExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }),
                    }}>
                      <p style={{ margin: 0, color: 'var(--theme-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                        {pDesc}
                      </p>
                    </div>
                    {pDesc.length > 200 && (
                      <button onClick={() => setDescExpanded(e => !e)} style={{ color: 'var(--theme-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: '0.875rem', fontWeight: 500 }}>
                        {descExpanded ? (isArabic ? 'أقل' : 'Show less') : (isArabic ? 'اقرأ المزيد' : 'Read more')}
                      </button>
                    )}
                  </div>
                )}

                {/* Sizes */}
                {availableSizes.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{
                      fontSize: '13px', color: 'var(--theme-text-secondary)',
                      marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {i18n.language === 'ar' ? 'المقاس' : 'Size'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {availableSizes.map(size => {
                        const isSelected = selectedSize === size;
                        const hasStock = variants.some(v => v.size === size && v.stock > 0);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => !isSelected && handleSizeChange(size)}
                            style={{
                              padding: '8px 16px', borderRadius: '50px',
                              border: `1.5px solid ${isSelected ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                              background: isSelected ? 'var(--theme-accent)' : 'transparent',
                              color: isSelected ? 'var(--theme-surface)' : 'var(--theme-text-primary)',
                              cursor: hasStock ? 'pointer' : 'not-allowed',
                              opacity: hasStock ? 1 : 0.4,
                              textDecoration: hasStock ? 'none' : 'line-through',
                              fontWeight: isSelected ? 500 : 400,
                              fontSize: '14px', fontFamily: 'inherit',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {availableColors.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{
                      fontSize: '13px', color: 'var(--theme-text-secondary)',
                      marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {i18n.language === 'ar' ? 'اللون' : 'Color'}
                      {selectedColor && (
                        <span style={{
                          fontWeight: 500, color: 'var(--theme-text-primary)',
                          marginInlineStart: '8px', textTransform: 'none',
                        }}>
                          — {selectedColor}
                        </span>
                      )}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {availableColors.map(color => {
                        const variant = selectedSize
                          ? variants.find(v => v.size === selectedSize && v.color === color)
                          : variants.find(v => v.color === color);
                        const hex = variant?.color_hex || getColorHex(color);
                        const isSelected = selectedColor === color;
                        const hasStock = variant ? variant.stock > 0 : true;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => hasStock && handleColorChange(color)}
                            title={color}
                            aria-label={color}
                            style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              backgroundColor: hex, padding: 0,
                              border: isSelected
                                ? '3px solid var(--theme-accent)'
                                : '2px solid var(--theme-border)',
                              cursor: hasStock ? 'pointer' : 'not-allowed',
                              opacity: hasStock ? 1 : 0.4,
                              outline: isSelected ? '2px solid var(--theme-surface)' : 'none',
                              outlineOffset: '-4px',
                              transition: 'all 0.2s ease',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {stock !== 0 && (
                  <div>
                    <p style={LABEL}>{isArabic ? 'الكمية' : 'Quantity'}</p>
                    <QuantitySelector
                      quantity={quantity}
                      max={Math.min(stock ?? 10, 10)}
                      onInc={() => setQuantity(q => Math.min(q + 1, Math.min(stock ?? 10, 10)))}
                      onDec={() => setQuantity(q => Math.max(q - 1, 1))}
                    />
                  </div>
                )}

                {/* Desktop action buttons */}
                <div className="pd-main-actions">
                  <button onClick={handleAddToCart} disabled={isOutOfStock || cartLoading} style={primaryBtn}>
                    {primaryLabel}
                  </button>
                  <button onClick={handleWishlist} style={secondaryBtn}>
                    {isInWishlist
                      ? <><HeartSolidIcon style={{ width: '18px', height: '18px', color: '#ef4444' }} />{isArabic ? 'في المفضلة' : 'In Wishlist'}</>
                      : <><HeartIcon     style={{ width: '18px', height: '18px' }}                   />{isArabic ? 'أضف إلى المفضلة' : 'Add to Wishlist'}</>}
                  </button>
                </div>

                {/* Expandable product details */}
                <ProductDetailsSection product={product} selectedVariant={selectedVariant} isArabic={isArabic} />
              </div>
            </div>
          </div>

          {/* Mobile sticky add to cart */}
          <div className="pd-sticky-cart">
            <button onClick={handleAddToCart} disabled={isOutOfStock || cartLoading} style={primaryBtn}>
              {primaryLabel}
            </button>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <SectionWrapper title="قد يعجبك أيضاً" titleEn="You might also like">
              <div className="pd-related-grid">
                {relatedProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isInWishlist={wishlistVariantIds.has(p.variants?.[0]?.id)}
                    onWishlistToggle={handleRelatedWishlistToggle}
                  />
                ))}
              </div>
            </SectionWrapper>
          )}
        </>
      )}
    </div>
  );
}
