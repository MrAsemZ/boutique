import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();

  // Single source of truth — initialized once from URL, then we own it
  const [filters, setFilters] = useState(() => ({
    search:    searchParams.get('search')    ?? '',
    category:  categorySlug ?? searchParams.get('category') ?? null,
    price_min: searchParams.get('price_min') ?? '',
    price_max: searchParams.get('price_max') ?? '',
    sizes:     searchParams.getAll('size'),
    colors:    searchParams.getAll('color'),
    materials: searchParams.getAll('material'),
    sort:      searchParams.get('sort')      ?? 'newest',
    page:      Number(searchParams.get('page') ?? 1),
  }));

  // When the route :categorySlug param changes (e.g. /shop → /shop/men),
  // keep filters.category in sync without touching other active filters.
  useEffect(() => {
    const next = categorySlug ?? null;
    setFilters(prev =>
      prev.category === next ? prev : { ...prev, category: next, page: 1 }
    );
  }, [categorySlug]);

  // Mirror filter state → URL (replace, so no extra history entries).
  // filters is a useState value — its reference only changes when setFilters
  // is called, so this effect won't loop after setSearchParams fires.
  useEffect(() => {
    const p = new URLSearchParams();
    if (filters.search)                        p.set('search',    filters.search);
    if (filters.category && !categorySlug)     p.set('category',  filters.category);
    if (filters.price_min)                     p.set('price_min', filters.price_min);
    if (filters.price_max)                     p.set('price_max', filters.price_max);
    filters.sizes.forEach(s =>                 p.append('size',      s));
    filters.colors.forEach(c =>                p.append('color',     c));
    filters.materials.forEach(m =>             p.append('material',  m));
    if (filters.sort !== 'newest')             p.set('sort',  filters.sort);
    if (filters.page > 1)                      p.set('page',  String(filters.page));
    setSearchParams(p, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Generic updater — always resets page unless the patch itself sets page
  const update = useCallback((patch) => {
    setFilters(prev => ({
      ...prev,
      ...patch,
      page: 'page' in patch ? patch.page : 1,
    }));
  }, []);

  const setSearch   = useCallback((term)       => update({ search: term }),         [update]);
  const setCategory = useCallback((slug)       => update({ category: slug }),        [update]);
  const setPriceRange = useCallback((min, max) => update({ price_min: min, price_max: max }), [update]);
  const setSort     = useCallback((value)      => update({ sort: value }),           [update]);
  const setPage     = useCallback((num)        =>
    setFilters(prev => ({ ...prev, page: num })), []);

  const toggleSize = useCallback((size) =>
    setFilters(prev => ({
      ...prev, page: 1,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    })), []);

  const toggleColor = useCallback((color) =>
    setFilters(prev => ({
      ...prev, page: 1,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    })), []);

  const toggleMaterial = useCallback((material) =>
    setFilters(prev => ({
      ...prev, page: 1,
      materials: prev.materials.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...prev.materials, material],
    })), []);

  const clearFilters = useCallback(() =>
    setFilters({
      search: '', category: categorySlug ?? null, price_min: '', price_max: '',
      sizes: [], colors: [], materials: [], sort: 'newest', page: 1,
    }), [categorySlug]);

  const activeCount = [
    filters.search,
    filters.price_min || filters.price_max,
    ...filters.sizes,
    ...filters.colors,
    ...filters.materials,
  ].filter(Boolean).length;

  return {
    filters,
    activeCount,
    hasFilters: activeCount > 0,
    setSearch, setCategory, setPriceRange, setSort, setPage,
    toggleSize, toggleColor, toggleMaterial, clearFilters,
  };
}
