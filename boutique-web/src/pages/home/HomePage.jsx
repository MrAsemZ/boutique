import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useCategories } from '../../hooks/api/useCategories';
import { useFeaturedProducts, useProducts } from '../../hooks/api/useProducts';
import SectionWrapper from '../../components/common/SectionWrapper';
import ProductCard from '../../components/product/ProductCard';
import SkeletonCard from '../../components/common/SkeletonCard';

const HOME_STYLES = `
  @keyframes hero-fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes cat-enter {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .home-cat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .home-product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  .home-new-scroll {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 12px;
    scrollbar-width: thin;
    scrollbar-color: var(--theme-border) transparent;
  }
  .home-new-scroll > * { flex: 0 0 220px; }
  @media (min-width: 768px) {
    .home-product-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1024px) {
    .home-cat-grid     { grid-template-columns: repeat(4, 1fr); }
    .home-product-grid { grid-template-columns: repeat(4, 1fr); }
    .home-new-scroll {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      overflow-x: unset;
      padding-bottom: 0;
    }
    .home-new-scroll > * { flex: none; }
  }
`;

const FALLBACK_CATEGORIES = [
  { id: 1, slug: 'men',         display_name: 'رجال',       display_name_en: "Men's"        },
  { id: 2, slug: 'women',       display_name: 'نساء',       display_name_en: "Women's"      },
  { id: 3, slug: 'kids',        display_name: 'أطفال',      display_name_en: 'Kids'         },
  { id: 4, slug: 'accessories', display_name: 'إكسسوارات',  display_name_en: 'Accessories'  },
];

const CAT_GRADIENTS = {
  men:         'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  women:       'linear-gradient(135deg, #2d1b33 0%, #4a2560 100%)',
  kids:        'linear-gradient(135deg, #ff6b9d 0%, #ffa8cc 100%)',
  accessories: 'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)',
};
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #111827 0%, #374151 100%)';

function getCatGradient(slug = '') {
  const key = Object.keys(CAT_GRADIENTS).find((k) => slug.toLowerCase().includes(k));
  return CAT_GRADIENTS[key] ?? DEFAULT_GRADIENT;
}

const CATEGORY_TAGLINES = {
  men:         { ar: 'أناقة الرجل العصري',           en: "Modern men's style"            },
  women:       { ar: 'جمال وأناقة لا حدود لها',      en: 'Timeless feminine elegance'    },
  kids:        { ar: 'ملابس مريحة وجميلة لأطفالك',  en: 'Colorful & fun for little ones' },
  accessories: { ar: 'اكمل إطلالتك بلمسة مميزة',    en: 'Complete your look'             },
};

function getTagline(slug = '', lang) {
  if (!slug) return lang === 'ar' ? 'تسوق الآن' : 'Shop Now';
  if (slug.includes('women'))       return CATEGORY_TAGLINES['women'][lang];
  if (slug.includes('men'))         return CATEGORY_TAGLINES['men'][lang];
  if (slug.includes('kids'))        return CATEGORY_TAGLINES['kids'][lang];
  if (slug.includes('accessories')) return CATEGORY_TAGLINES['accessories'][lang];
  return lang === 'ar' ? 'تسوق الآن' : 'Shop Now';
}

const CATEGORY_IMAGES = {
  women:       'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=400&fit=crop',
  men:         'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=400&fit=crop',
  kids:        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=400&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&h=400&fit=crop',
  default:     'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop',
};

function getCategoryImage(slug = '') {
  const key = Object.keys(CATEGORY_IMAGES).find((k) => k !== 'default' && slug.toLowerCase().includes(k));
  return CATEGORY_IMAGES[key] ?? CATEGORY_IMAGES.default;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function HeroSection({ isArabic }) {
  return (
    <div style={{
      position: 'relative', minHeight: '85vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--theme-bg) 0%, var(--theme-surface) 100%)',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'var(--theme-accent)', opacity: 0.08, filter: 'blur(100px)',
        top: '-150px', insetInlineEnd: '-100px', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '350px', height: '350px', borderRadius: '50%',
        background: 'var(--theme-accent)', opacity: 0.06, filter: 'blur(80px)',
        bottom: '-80px', insetInlineStart: '-60px', pointerEvents: 'none',
      }} />

      <div style={{
        textAlign: 'center', padding: '40px 24px',
        position: 'relative', zIndex: 1, maxWidth: '720px',
        animation: 'hero-fade-in 0.8s ease-out both',
      }}>
        <h1 style={{
          fontSize: 'clamp(2.25rem, 6vw, 4rem)', fontWeight: 800,
          color: 'var(--theme-text-primary)', margin: '0 0 16px',
          lineHeight: 1.15,
          letterSpacing: isArabic ? 0 : '-0.02em',
        }}>
          {isArabic ? 'اكتشف أناقتك' : 'Discover Your Style'}
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: 'var(--theme-text-secondary)', margin: '0 0 40px', lineHeight: 1.6,
        }}>
          {isArabic
            ? 'أحدث صيحات الموضة من أفضل البائعين'
            : 'Latest fashion trends from top vendors'}
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/shop"
            style={{
              padding: '14px 36px', borderRadius: '50px',
              background: 'var(--theme-accent)', color: 'var(--theme-bg)',
              fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
          >
            {isArabic ? 'تسوق الآن' : 'Shop Now'}
          </Link>
          <Link
            to="/shop"
            style={{
              padding: '14px 36px', borderRadius: '50px',
              border: '2px solid var(--theme-accent)', color: 'var(--theme-accent)',
              fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
              transition: 'opacity 0.2s, transform 0.15s', background: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
          >
            {isArabic ? 'اكتشف المجموعات' : 'Explore Collections'}
          </Link>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ category, isArabic, index, onHover, onLeave, onNavigate }) {
  const name = isArabic
    ? (category.name_ar ?? category.display_name)
    : (category.name ?? category.display_name_en ?? category.display_name);
  const tagline = getTagline(category.slug, isArabic ? 'ar' : 'en');

  return (
    <div
      style={{
        height: '200px', borderRadius: '12px', overflow: 'hidden',
        backgroundImage: `url(${getCategoryImage(category.slug)})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor: getCatGradient(category.slug),
        position: 'relative', cursor: 'pointer',
        transition: 'transform 0.3s ease, filter 0.3s ease',
        animation: `cat-enter 0.5s ease-out ${Math.min(index, 7) * 100}ms both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.filter = 'brightness(1.12)';
        onHover(category.slug);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.filter = 'brightness(1)';
        onLeave();
      }}
      onClick={() => onNavigate(category.slug)}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)',
      }} />
      <div style={{ position: 'absolute', bottom: '16px', insetInlineStart: '16px' }}>
        <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '1.0625rem', color: '#fff' }}>
          {name}
        </p>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>
          {tagline}
        </p>
      </div>
    </div>
  );
}

function PromoBanner({ isArabic }) {
  return (
    <div style={{
      background: 'var(--theme-accent)', minHeight: '200px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '28px 28px', pointerEvents: 'none',
      }} />
      <div style={{ textAlign: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 600,
          color: '#fff', margin: '0 0 24px', lineHeight: 1.5,
        }}>
          {isArabic
            ? '🎉 استخدم كود WELCOME20 واحصل على خصم 20%'
            : '🎉 Use code WELCOME20 for 20% off your first order'}
        </p>
        <Link
          to="/shop"
          style={{
            display: 'inline-block', padding: '12px 32px', borderRadius: '50px',
            background: '#fff', color: 'var(--theme-accent)',
            fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none',
            transition: 'opacity 0.2s, transform 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
        >
          {isArabic ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </div>
    </div>
  );
}

function ErrorRetry({ isArabic, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--theme-text-secondary)' }}>
      <p style={{ margin: '0 0 16px', fontSize: '0.9375rem' }}>
        {isArabic ? 'حدث خطأ أثناء التحميل' : 'Something went wrong'}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: '10px 28px', borderRadius: '50px',
          border: '1.5px solid var(--theme-accent)', background: 'transparent',
          color: 'var(--theme-accent)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        {isArabic ? 'إعادة المحاولة' : 'Try Again'}
      </button>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const { setThemeForCategory, setTheme } = useTheme();

  const {
    data: categoriesData, isLoading: catLoading, isError: catError,
  } = useCategories();

  const {
    data: featuredData, isLoading: featuredLoading, isError: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedProducts();

  const {
    data: newArrivalsData, isLoading: newLoading, isError: newError,
    refetch: refetchNew,
  } = useProducts({ sort: 'newest', per_page: 8 });

  const categories    = Array.isArray(categoriesData)   ? categoriesData   : (categoriesData?.data   ?? []);
  const featured      = Array.isArray(featuredData)     ? featuredData     : (featuredData?.data     ?? []);
  const newArrivals   = Array.isArray(newArrivalsData)  ? newArrivalsData  : (newArrivalsData?.data  ?? []);

  const displayCategories = catError ? FALLBACK_CATEGORIES : categories;

  const handleCategoryClick = (slug) => {
    setThemeForCategory(slug);
    navigate(`/shop/${slug}`);
  };

  return (
    <>
      <style>{HOME_STYLES}</style>

      <HeroSection isArabic={isArabic} />

      {/* ── Categories ── */}
      <SectionWrapper title="تسوق حسب الفئة" titleEn="Shop by Category">
        {catLoading ? (
          <div className="home-cat-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                height: '200px', borderRadius: '12px',
                background: 'var(--theme-border)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : (
          <div className="home-cat-grid">
            {displayCategories.map((cat, i) => (
              <CategoryCard
                key={cat.id ?? cat.slug}
                category={cat}
                isArabic={isArabic}
                index={i}
                onHover={setThemeForCategory}
                onLeave={() => setTheme('default')}
                onNavigate={handleCategoryClick}
              />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* ── Featured Products ── */}
      <SectionWrapper title="منتجات مميزة" titleEn="Featured Products" viewAllLink="/shop">
        {featuredLoading ? (
          <div className="home-product-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : featuredError ? (
          <ErrorRetry isArabic={isArabic} onRetry={refetchFeatured} />
        ) : featured.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--theme-text-secondary)', padding: '48px 0' }}>
            {isArabic ? 'لا توجد منتجات مميزة حالياً' : 'No featured products available'}
          </p>
        ) : (
          <div className="home-product-grid">
            {featured.slice(0, 12).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </SectionWrapper>

      <PromoBanner isArabic={isArabic} />

      {/* ── New Arrivals ── */}
      <SectionWrapper
        title="وصل حديثاً"
        titleEn="New Arrivals"
        viewAllLink="/shop?sort=newest"
      >
        {newLoading ? (
          <div className="home-product-grid">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : newError ? (
          <ErrorRetry isArabic={isArabic} onRetry={refetchNew} />
        ) : (
          <div className="home-new-scroll">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
