import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { debounce } from '../../utils/debounce';

// ── Static filter data ──────────────────────────────────────────────────────

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const COLORS = [
  { value: 'black',  hex: '#1A1A1A', ar: 'أسود',  en: 'Black'  },
  { value: 'white',  hex: '#F0F0F0', ar: 'أبيض',  en: 'White',  border: true },
  { value: 'navy',   hex: '#1B2A4A', ar: 'كحلي',  en: 'Navy'   },
  { value: 'gray',   hex: '#9CA3AF', ar: 'رمادي', en: 'Gray'   },
  { value: 'red',    hex: '#EF4444', ar: 'أحمر',  en: 'Red'    },
  { value: 'blue',   hex: '#3B82F6', ar: 'أزرق',  en: 'Blue'   },
  { value: 'green',  hex: '#10B981', ar: 'أخضر',  en: 'Green'  },
  { value: 'brown',  hex: '#92400E', ar: 'بني',   en: 'Brown'  },
  { value: 'beige',  hex: '#D4B483', ar: 'بيج',   en: 'Beige'  },
];

export const MATERIALS = [
  { value: 'cotton',    ar: 'قطن',     en: 'Cotton'    },
  { value: 'polyester', ar: 'بوليستر', en: 'Polyester' },
  { value: 'wool',      ar: 'صوف',     en: 'Wool'      },
  { value: 'silk',      ar: 'حرير',    en: 'Silk'      },
  { value: 'linen',     ar: 'كتان',    en: 'Linen'     },
  { value: 'leather',   ar: 'جلد',     en: 'Leather'   },
];

// ── Collapsible section wrapper ─────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--theme-border)' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', width: '100%', justifyContent: 'space-between',
          alignItems: 'center', padding: '14px 0', border: 'none',
          background: 'none', cursor: 'pointer',
          color: 'var(--theme-text-primary)', fontWeight: 500, fontSize: '0.875rem',
        }}
      >
        {title}
        <ChevronDownIcon style={{
          width: '15px', height: '15px', flexShrink: 0,
          color: 'var(--theme-text-hint)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }} />
      </button>
      {open && <div style={{ paddingBottom: '16px' }}>{children}</div>}
    </div>
  );
}

// ── Category tree item ──────────────────────────────────────────────────────

function CatItem({ cat, activeSlug, isArabic, onSelect, depth = 0 }) {
  const [hovered, setHovered] = useState(false);
  const isActive = cat.slug === activeSlug;
  const name = cat.display_name ||
    (isArabic ? cat.name_ar : cat.name) ||
    cat.name;
  return (
    <button
      type="button"
      onClick={() => onSelect(cat.slug)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block', width: '100%', textAlign: 'start', border: 'none',
        paddingTop: '6px', paddingBottom: '6px',
        paddingInlineStart: `${depth * 16 + 8}px`, paddingInlineEnd: '8px',
        borderRadius: '6px', cursor: 'pointer',
        background: isActive
          ? 'color-mix(in srgb, var(--theme-accent) 15%, transparent)'
          : hovered
            ? 'color-mix(in srgb, var(--theme-accent) 8%, transparent)'
            : 'transparent',
        color: isActive ? 'var(--theme-accent)' : 'var(--theme-text-primary)',
        fontWeight: isActive ? 700 : 400,
        borderInlineStart: isActive ? '3px solid var(--theme-accent)' : '3px solid transparent',
        fontSize: '0.875rem',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {name}
    </button>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function FiltersSidebar({
  filters, categories, isArabic,
  onSearch, onCategorySelect,
  onToggleSize, onToggleColor, onToggleMaterial,
  onPriceRange, onClearFilters, activeCount,
}) {
  const [searchVal, setSearchVal] = useState(filters.search || '');
  const [priceMin, setPriceMin]   = useState(filters.price_min || '');
  const [priceMax, setPriceMax]   = useState(filters.price_max || '');

  const debouncedSearch = useMemo(() => debounce(onSearch, 500), [onSearch]);

  // Sync local inputs when external clearFilters fires
  useEffect(() => { setSearchVal(filters.search || ''); },    [filters.search]);
  useEffect(() => { setPriceMin(filters.price_min || ''); },  [filters.price_min]);
  useEffect(() => { setPriceMax(filters.price_max || ''); },  [filters.price_max]);

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handlePriceBlur = () => onPriceRange(priceMin, priceMax);

  // Build category tree (2 levels)
  const catById = {};
  categories.forEach(c => { catById[c.id] = { ...c, children: [] }; });
  const catRoots = [];
  categories.forEach(c => {
    if (c.parent_id && catById[c.parent_id]) {
      catById[c.parent_id].children.push(catById[c.id]);
    } else if (catById[c.id]) {
      catRoots.push(catById[c.id]);
    }
  });

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', borderRadius: '8px',
    border: '1px solid var(--theme-border)',
    background: 'var(--theme-bg)', color: 'var(--theme-text-primary)',
    fontSize: '0.875rem', outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ padding: '0 16px 24px' }}>

      {/* Clear all — only when filters are active */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClearFilters}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            width: '100%', padding: '8px 16px', borderRadius: '50px',
            border: 'none', background: 'var(--theme-accent)',
            color: 'var(--theme-surface)',
            fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', margin: '12px 0 4px',
          }}
        >
          <XMarkIcon style={{ width: '13px', height: '13px' }} />
          {isArabic ? `مسح الكل (${activeCount})` : `Clear All (${activeCount})`}
        </button>
      )}

      {/* ── Search ─────────────────────────────────────────── */}
      <Section title={isArabic ? 'البحث' : 'Search'}>
        <div style={{ position: 'relative' }}>
          <MagnifyingGlassIcon style={{
            position: 'absolute', width: '15px', height: '15px',
            insetInlineStart: '10px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--theme-text-hint)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder={isArabic ? 'ابحث عن منتج...' : 'Search products...'}
            className="theme-input"
            style={{ ...inputStyle, paddingInlineStart: '34px' }}
          />
        </div>
      </Section>

      {/* ── Categories ─────────────────────────────────────── */}
      {catRoots.length > 0 && (
        <Section title={isArabic ? 'الفئات' : 'Categories'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {catRoots.map(cat => (
              <div key={cat.id}>
                <CatItem
                  cat={cat} activeSlug={filters.category}
                  isArabic={isArabic} onSelect={onCategorySelect} depth={0}
                />
                {cat.children?.map(child => (
                  <CatItem
                    key={child.id} cat={child} activeSlug={filters.category}
                    isArabic={isArabic} onSelect={onCategorySelect} depth={1}
                  />
                ))}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Price range ────────────────────────────────────── */}
      <Section title={isArabic ? 'السعر (د.أ)' : 'Price (JOD)'}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number" value={priceMin} min={0}
            onChange={e => setPriceMin(e.target.value)}
            onBlur={handlePriceBlur}
            placeholder={isArabic ? 'الأدنى' : 'Min'}
            style={{ ...inputStyle, width: '50%' }}
          />
          <span style={{ color: 'var(--theme-text-hint)', fontSize: '0.75rem', flexShrink: 0 }}>—</span>
          <input
            type="number" value={priceMax} min={0}
            onChange={e => setPriceMax(e.target.value)}
            onBlur={handlePriceBlur}
            placeholder={isArabic ? 'الأعلى' : 'Max'}
            style={{ ...inputStyle, width: '50%' }}
          />
        </div>
        {(filters.price_min || filters.price_max) && (
          <p style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary)', margin: '6px 0 0' }}>
            {filters.price_min || '0'} د.أ — {filters.price_max || '∞'} د.أ
          </p>
        )}
      </Section>

      {/* ── Size ───────────────────────────────────────────── */}
      <Section title={isArabic ? 'المقاس' : 'Size'}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SIZES.map(size => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size} type="button"
                onClick={() => onToggleSize(size)}
                style={{
                  padding: '5px 14px', borderRadius: '50px', fontSize: '0.8125rem',
                  fontWeight: 500, cursor: 'pointer',
                  border: `2px solid ${active ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                  background: active ? 'var(--theme-accent)' : 'transparent',
                  color: active ? 'var(--theme-surface)' : 'var(--theme-text-secondary)',
                  boxShadow: active ? '0 2px 8px color-mix(in srgb, var(--theme-accent) 40%, transparent)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Color ──────────────────────────────────────────── */}
      <Section title={isArabic ? 'اللون' : 'Color'}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {COLORS.map(color => {
            const active = filters.colors.includes(color.value);
            return (
              <button
                key={color.value} type="button"
                onClick={() => onToggleColor(color.value)}
                title={isArabic ? color.ar : color.en}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: color.hex, cursor: 'pointer', padding: 0,
                  border: active
                    ? '3px solid var(--theme-accent)'
                    : `2px solid ${color.border ? 'var(--theme-border)' : 'transparent'}`,
                  boxShadow: active ? '0 0 0 3px var(--theme-bg), 0 0 0 4px var(--theme-accent)' : 'none',
                  outline: 'none', transition: 'border 0.15s, box-shadow 0.15s',
                }}
              />
            );
          })}
        </div>
      </Section>

      {/* ── Material ───────────────────────────────────────── */}
      <Section title={isArabic ? 'المادة' : 'Material'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {MATERIALS.map(mat => {
            const active = filters.materials.includes(mat.value);
            return (
              <label
                key={mat.value}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  cursor: 'pointer', userSelect: 'none', fontSize: '0.875rem',
                  color: active ? 'var(--theme-accent)' : 'var(--theme-text-secondary)',
                }}
              >
                <input
                  type="checkbox" checked={active}
                  onChange={() => onToggleMaterial(mat.value)}
                  style={{ accentColor: 'var(--theme-accent)', width: '15px', height: '15px', flexShrink: 0 }}
                />
                {isArabic ? mat.ar : mat.en}
              </label>
            );
          })}
        </div>
      </Section>

    </div>
  );
}
