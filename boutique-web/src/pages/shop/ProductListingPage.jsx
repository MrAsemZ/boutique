import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdjustmentsHorizontalIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useCategories } from '../../hooks/api/useCategories';
import { useProducts } from '../../hooks/api/useProducts';
import { useFilters } from '../../hooks/useFilters';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../../hooks/api/useWishlist';
import ProductCard from '../../components/product/ProductCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import FiltersSidebar, { COLORS, MATERIALS } from '../../components/shop/FiltersSidebar';

// ── CSS ─────────────────────────────────────────────────────────────────────

const SHOP_STYLES = `
  .shop-layout {
    display: flex;
    align-items: flex-start;
    max-width: 1440px;
    margin: 0 auto;
  }
  .shop-sidebar {
    width: 280px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    max-height: 100vh;
    overflow-y: auto;
    border-inline-end: 1px solid var(--theme-border);
    background: var(--theme-surface);
  }
  .shop-sidebar::-webkit-scrollbar { width: 4px; }
  .shop-sidebar::-webkit-scrollbar-thumb {
    background: var(--theme-border); border-radius: 2px;
  }
  .shop-main {
    flex: 1;
    min-width: 0;
    padding: 24px;
  }
  .shop-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .mobile-filter-btn {
    display: none;
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    padding: 12px 28px;
    border-radius: 50px;
    background: var(--theme-accent);
    color: var(--theme-bg);
    border: none;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    font-family: inherit;
    white-space: nowrap;
  }
  @media (max-width: 767px) {
    .shop-sidebar     { display: none; }
    .mobile-filter-btn { display: flex; }
  }
  @media (min-width: 768px) {
    .shop-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1280px) {
    .shop-grid { grid-template-columns: repeat(4, 1fr); }
  }
`;

// ── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest',     ar: 'الأحدث',          en: 'Newest'              },
  { value: 'price_asc',  ar: 'السعر: الأقل',     en: 'Price: Low to High'  },
  { value: 'price_desc', ar: 'السعر: الأعلى',    en: 'Price: High to Low'  },
  { value: 'popularity', ar: 'الأكثر مبيعاً',    en: 'Most Popular'        },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_LABEL = Object.fromEntries(COLORS.map(c => [c.value, { ar: c.ar, en: c.en }]));
const MAT_LABEL   = Object.fromEntries(MATERIALS.map(m => [m.value, { ar: m.ar, en: m.en }]));

function buildApiParams(filters) {
  const p = {};
  if (filters.search)            p.search    = filters.search;
  if (filters.category)          p.category  = filters.category;
  if (filters.price_min)         p.price_min = filters.price_min;
  if (filters.price_max)         p.price_max = filters.price_max;
  if (filters.sizes.length)      p.size      = filters.sizes[0];
  if (filters.colors.length)     p.color     = filters.colors[0];
  if (filters.materials.length)  p.material  = filters.materials[0];
  p.sort     = filters.sort;
  p.page     = filters.page;
  p.per_page = 12;
  return p;
}

function getPageNumbers(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('…');
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < last - 2) pages.push('…');
  pages.push(last);
  return pages;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Breadcrumb({ isArabic, pageTitle, categorySlug }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--theme-text-hint)', marginBottom: '12px', flexWrap: 'wrap' }}>
      <Link to="/" style={{ color: 'var(--theme-text-hint)', textDecoration: 'none' }}>
        {isArabic ? 'الرئيسية' : 'Home'}
      </Link>
      <ChevronRightIcon style={{ width: '12px', height: '12px', flexShrink: 0 }} />
      {categorySlug ? (
        <>
          <Link to="/shop" style={{ color: 'var(--theme-text-hint)', textDecoration: 'none' }}>
            {isArabic ? 'المتجر' : 'Shop'}
          </Link>
          <ChevronRightIcon style={{ width: '12px', height: '12px', flexShrink: 0 }} />
          <span style={{ color: 'var(--theme-text-primary)', fontWeight: 500 }}>{pageTitle}</span>
        </>
      ) : (
        <span style={{ color: 'var(--theme-text-primary)', fontWeight: 500 }}>
          {isArabic ? 'المتجر' : 'Shop'}
        </span>
      )}
    </nav>
  );
}

function ActiveFilters({ filters, isArabic, onToggleSize, onToggleColor, onToggleMaterial, onClearAll, setPriceRange, setSearch }) {
  const tags = [];
  if (filters.search) {
    tags.push({ key: 'search', label: `${isArabic ? 'بحث' : 'Search'}: ${filters.search}`, remove: () => setSearch('') });
  }
  if (filters.price_min || filters.price_max) {
    tags.push({ key: 'price', label: `${filters.price_min || '0'} — ${filters.price_max || '∞'} د.أ`, remove: () => setPriceRange('', '') });
  }
  filters.sizes.forEach(s => tags.push({ key: `sz-${s}`, label: `${isArabic ? 'مقاس' : 'Size'}: ${s}`, remove: () => onToggleSize(s) }));
  filters.colors.forEach(c => tags.push({ key: `cl-${c}`, label: `${isArabic ? 'لون' : 'Color'}: ${(COLOR_LABEL[c]?.[isArabic ? 'ar' : 'en']) || c}`, remove: () => onToggleColor(c) }));
  filters.materials.forEach(m => tags.push({ key: `mt-${m}`, label: `${isArabic ? 'مادة' : 'Material'}: ${(MAT_LABEL[m]?.[isArabic ? 'ar' : 'en']) || m}`, remove: () => onToggleMaterial(m) }));

  if (tags.length === 0) return null;

  const tagStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 10px', borderRadius: '50px',
    background: 'var(--theme-surface)', border: '1px solid var(--theme-accent)',
    color: 'var(--theme-accent)', fontSize: '0.8rem',
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 0' }}>
      {tags.map(tag => (
        <span key={tag.key} style={tagStyle}>
          {tag.label}
          <button
            type="button" onClick={tag.remove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--theme-accent)', lineHeight: 1, fontSize: '1rem' }}
          >
            ×
          </button>
        </span>
      ))}
      <button
        type="button" onClick={onClearAll}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--theme-text-secondary)', fontSize: '0.8rem', padding: '4px 8px', textDecoration: 'underline' }}
      >
        {isArabic ? 'مسح الكل' : 'Clear all'}
      </button>
    </div>
  );
}

function Pagination({ current, last, onChange, isArabic }) {
  if (last <= 1) return null;
  const pages = getPageNumbers(current, last);

  const btnBase = {
    minWidth: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--theme-border)',
    background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', padding: '0 8px',
    color: 'var(--theme-text-secondary)', transition: 'border-color 0.15s, color 0.15s',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '40px', flexWrap: 'wrap' }}>
      <button
        style={{ ...btnBase, opacity: current === 1 ? 0.4 : 1 }}
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        {isArabic ? 'السابق' : 'Prev'}
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--theme-text-hint)', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...btnBase,
              background:   p === current ? 'var(--theme-accent)' : 'transparent',
              color:        p === current ? 'var(--theme-bg)'     : 'var(--theme-text-secondary)',
              borderColor:  p === current ? 'var(--theme-accent)' : 'var(--theme-border)',
              fontWeight:   p === current ? 700 : 400,
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        style={{ ...btnBase, opacity: current === last ? 0.4 : 1 }}
        disabled={current === last}
        onClick={() => onChange(current + 1)}
      >
        {isArabic ? 'التالي' : 'Next'}
      </button>
    </div>
  );
}

function EmptyState({ isArabic, onClear }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--theme-text-secondary)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.4 }}>🔍</div>
      <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--theme-text-primary)', margin: '0 0 8px' }}>
        {isArabic ? 'لم يتم العثور على منتجات' : 'No products found'}
      </p>
      <p style={{ fontSize: '0.9rem', margin: '0 0 24px' }}>
        {isArabic ? 'جرب تغيير الفلاتر أو البحث بكلمة مختلفة' : 'Try adjusting your filters or search term'}
      </p>
      <button
        onClick={onClear}
        style={{
          padding: '10px 28px', borderRadius: '50px', cursor: 'pointer',
          border: '1.5px solid var(--theme-accent)', background: 'transparent',
          color: 'var(--theme-accent)', fontWeight: 600, fontSize: '0.875rem',
        }}
      >
        {isArabic ? 'مسح الفلاتر' : 'Clear Filters'}
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProductListingPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { categorySlug } = useParams();
  const { setThemeForCategory } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const gridTopRef = useRef(null);

  const {
    filters, activeCount, hasFilters,
    setSearch, setCategory, setPriceRange, setSort, setPage,
    toggleSize, toggleColor, toggleMaterial, clearFilters,
  } = useFilters();

  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data ?? []);

  const stableFilters = useMemo(() => buildApiParams(filters), [
    filters.search, filters.category, filters.price_min,
    filters.price_max, filters.sizes, filters.colors,
    filters.materials, filters.sort, filters.page,
  ]);

  const { data, isLoading, isError, refetch } = useProducts(stableFilters);

  const { data: wishlistData } = useWishlist();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  const wishlistItems = wishlistData?.data?.items ?? wishlistData?.items ?? [];
  const wishlistVariantIds = new Set(wishlistItems.map(i => i.variant?.id).filter(Boolean));

  const handleWishlistToggle = (product) => {
    const variantId = product.first_variant_id ?? product.variants?.[0]?.id;
    if (!variantId) return;
    const isIn = wishlistVariantIds.has(variantId);
    if (isIn) {
      const wItem = wishlistItems.find(i => i.variant?.id === variantId);
      if (wItem) removeFromWishlist(wItem.id);
    } else {
      addToWishlist({ product_variant_id: variantId });
    }
  };

  const products  = Array.isArray(data) ? data : (data?.data ?? []);
  const meta      = data?.meta ?? null;
  const total     = meta?.total ?? products.length;
  const lastPage  = meta?.last_page ?? 1;
  const fromCount = meta?.from ?? (products.length ? 1 : 0);
  const toCount   = meta?.to   ?? products.length;

  // Sync route category slug → theme
  useEffect(() => {
    if (categorySlug) setThemeForCategory(categorySlug);
  }, [categorySlug, setThemeForCategory]);

  const handleCategorySelect = (slug) => {
    setThemeForCategory(slug);
    setCategory(slug);
  };

  const handlePageChange = (page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category name for title + breadcrumb
  const currentCat = categories.find(c => c.slug === (categorySlug || filters.category));
  const pageTitle  = currentCat
    ? (isArabic ? (currentCat.display_name_ar ?? currentCat.display_name) : (currentCat.display_name_en ?? currentCat.display_name))
    : (isArabic ? 'المتجر' : 'Shop');

  const sidebarProps = {
    filters, categories, isArabic,
    onSearch: setSearch,
    onCategorySelect: handleCategorySelect,
    onToggleSize: toggleSize,
    onToggleColor: toggleColor,
    onToggleMaterial: toggleMaterial,
    onPriceRange: setPriceRange,
    onClearFilters: clearFilters,
    activeCount,
  };

  return (
    <div style={{ background: 'var(--theme-bg)', minHeight: '100vh' }}>
      <style>{SHOP_STYLES}</style>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 24px 0' }}>
        <Breadcrumb isArabic={isArabic} pageTitle={pageTitle} categorySlug={categorySlug} />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
              {pageTitle}
            </h1>
            {!isLoading && (
              <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--theme-text-hint)' }}>
                {isArabic
                  ? `عرض ${fromCount}–${toCount} من ${total} منتج`
                  : `Showing ${fromCount}–${toCount} of ${total} products`}
              </p>
            )}
          </div>

          {/* Sort dropdown */}
          <select
            value={filters.sort}
            onChange={e => setSort(e.target.value)}
            style={{
              padding: '8px 32px 8px 12px', borderRadius: '8px',
              border: '1px solid var(--theme-border)',
              background: 'var(--theme-surface)', color: 'var(--theme-text-primary)',
              fontSize: '0.875rem', cursor: 'pointer', outline: 'none',
              fontFamily: 'inherit', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'calc(100% - 10px) center',
            }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {isArabic ? opt.ar : opt.en}
              </option>
            ))}
          </select>
        </div>

        {/* Active filter tags */}
        <ActiveFilters
          filters={filters} isArabic={isArabic}
          onToggleSize={toggleSize} onToggleColor={toggleColor}
          onToggleMaterial={toggleMaterial} onClearAll={clearFilters}
          setPriceRange={setPriceRange} setSearch={setSearch}
        />
      </div>

      {/* ── Two-column layout ─────────────────────────────────── */}
      <div className="shop-layout">

        {/* Desktop sidebar */}
        <aside className="shop-sidebar">
          <FiltersSidebar {...sidebarProps} />
        </aside>

        {/* Product area */}
        <main className="shop-main" ref={gridTopRef}>
          {isLoading ? (
            <div className="shop-grid">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : isError ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '16px' }}>
                {isArabic ? 'حدث خطأ أثناء التحميل' : 'Something went wrong'}
              </p>
              <button
                onClick={() => refetch()}
                style={{
                  padding: '10px 28px', borderRadius: '50px', cursor: 'pointer',
                  border: '1.5px solid var(--theme-accent)', background: 'transparent',
                  color: 'var(--theme-accent)', fontWeight: 600, fontSize: '0.875rem',
                }}
              >
                {isArabic ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          ) : products.length === 0 ? (
            <EmptyState isArabic={isArabic} onClear={clearFilters} />
          ) : (
            <>
              <div className="shop-grid">
                {products.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isInWishlist={wishlistVariantIds.has(p.first_variant_id ?? p.variants?.[0]?.id)}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>
              <Pagination
                current={filters.page} last={lastPage}
                onChange={handlePageChange} isArabic={isArabic}
              />
            </>
          )}
        </main>
      </div>

      {/* ── Mobile filter button ───────────────────────────────── */}
      <button
        className="mobile-filter-btn"
        onClick={() => setDrawerOpen(true)}
      >
        <AdjustmentsHorizontalIcon style={{ width: '18px', height: '18px' }} />
        {activeCount > 0
          ? (isArabic ? `الفلاتر (${activeCount})` : `Filters (${activeCount})`)
          : (isArabic ? 'الفلاتر' : 'Filters')}
      </button>

      {/* ── Mobile filter drawer ───────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.45)' }}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0,
            height: '82vh', background: 'var(--theme-surface)',
            borderRadius: '16px 16px 0 0', zIndex: 200,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Drawer header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid var(--theme-border)', flexShrink: 0,
            }}>
              <span style={{ fontWeight: 600, color: 'var(--theme-text-primary)', fontSize: '1rem' }}>
                {isArabic
                  ? (activeCount > 0 ? `الفلاتر (${activeCount})` : 'الفلاتر')
                  : (activeCount > 0 ? `Filters (${activeCount})` : 'Filters')}
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--theme-text-secondary)' }}
              >
                <XMarkIcon style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Scrollable sidebar content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <FiltersSidebar {...sidebarProps} />
            </div>

            {/* Apply button */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--theme-border)', flexShrink: 0 }}>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  width: '100%', padding: '13px', borderRadius: '50px', border: 'none',
                  background: 'var(--theme-accent)', color: 'var(--theme-bg)',
                  fontWeight: 600, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {isArabic ? 'تطبيق الفلاتر' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
