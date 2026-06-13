import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, RefreshControl, ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useProducts } from '../../src/hooks/api/useProducts';
import { useWishlist, useToggleWishlist } from '../../src/hooks/api/useWishlist';
import ProductCard from '../../src/components/ProductCard';
import EmptyState from '../../src/components/EmptyState';
import { themes } from '../../src/theme/colors';

const theme = themes.default;
const { width: SW } = Dimensions.get('window');
const ITEM_W = (SW - 16 * 2 - 12) / 2;

// ── Filter constants ────────────────────────────────────────────────────────

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const COLORS = [
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

const MATERIALS = [
  { value: 'cotton',    ar: 'قطن',     en: 'Cotton'    },
  { value: 'polyester', ar: 'بوليستر', en: 'Polyester' },
  { value: 'wool',      ar: 'صوف',     en: 'Wool'      },
  { value: 'silk',      ar: 'حرير',    en: 'Silk'      },
  { value: 'linen',     ar: 'كتان',    en: 'Linen'     },
  { value: 'leather',   ar: 'جلد',     en: 'Leather'   },
];

const FILTER_CATS = [
  { key: '',            ar: 'الكل',        en: 'All'         },
  { key: 'men',         ar: 'رجال',        en: 'Men'         },
  { key: 'women',       ar: 'نساء',        en: 'Women'       },
  { key: 'kids',        ar: 'أطفال',       en: 'Kids'        },
  { key: 'accessories', ar: 'إكسسوارات',  en: 'Accessories' },
];

const SORT_OPTIONS = [
  { key: 'newest',     ar: 'الأحدث',       en: 'Newest'       },
  { key: 'price_asc',  ar: 'السعر: الأقل', en: 'Price: Low'  },
  { key: 'price_desc', ar: 'السعر: الأعلى', en: 'Price: High' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

// ── Filter section wrapper ───────────────────────────────────────────────────

function FilterSection({ title, children }) {
  return (
    <View style={fs.section}>
      <Text style={fs.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function ShopScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isArabic = i18n.language === 'ar';

  // Search + sort
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort]                   = useState('newest');
  const [showSort, setShowSort]           = useState(false);
  const debounceRef = useRef(null);

  // Category quick-chips
  const [category, setCategory] = useState(params.category || '');
  useEffect(() => { if (params.category) setCategory(params.category); }, [params.category]);

  // Applied advanced filters
  const [filterSizes,     setFilterSizes]     = useState([]);
  const [filterColors,    setFilterColors]    = useState([]);
  const [filterMaterials, setFilterMaterials] = useState([]);
  const [filterPriceMin,  setFilterPriceMin]  = useState('');
  const [filterPriceMax,  setFilterPriceMax]  = useState('');

  // Filter modal
  const [showFilter, setShowFilter] = useState(false);

  // Draft state (lives inside modal)
  const [draftCategory,  setDraftCategory]  = useState('');
  const [draftSizes,     setDraftSizes]     = useState([]);
  const [draftColors,    setDraftColors]    = useState([]);
  const [draftMaterials, setDraftMaterials] = useState([]);
  const [draftPriceMin,  setDraftPriceMin]  = useState('');
  const [draftPriceMax,  setDraftPriceMax]  = useState('');

  const openFilter = () => {
    setDraftCategory(category);
    setDraftSizes([...filterSizes]);
    setDraftColors([...filterColors]);
    setDraftMaterials([...filterMaterials]);
    setDraftPriceMin(filterPriceMin);
    setDraftPriceMax(filterPriceMax);
    setShowFilter(true);
  };

  const applyFilters = () => {
    setCategory(draftCategory);
    setFilterSizes([...draftSizes]);
    setFilterColors([...draftColors]);
    setFilterMaterials([...draftMaterials]);
    setFilterPriceMin(draftPriceMin);
    setFilterPriceMax(draftPriceMax);
    setShowFilter(false);
  };

  const clearDraft = () => {
    setDraftCategory('');
    setDraftSizes([]);
    setDraftColors([]);
    setDraftMaterials([]);
    setDraftPriceMin('');
    setDraftPriceMax('');
  };

  const activeFilterCount =
    filterSizes.length + filterColors.length + filterMaterials.length +
    (filterPriceMin ? 1 : 0) + (filterPriceMax ? 1 : 0) + (category ? 1 : 0);

  // Search debounce
  const handleSearchChange = (text) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 500);
  };

  // API query
  const filters = {
    ...(debouncedSearch         && { search:    debouncedSearch }),
    ...(category                && { category }),
    ...(filterSizes.length      && { sizes:     filterSizes.join(',') }),
    ...(filterColors.length     && { colors:    filterColors.join(',') }),
    ...(filterMaterials.length  && { materials: filterMaterials.join(',') }),
    ...(filterPriceMin          && { price_min: filterPriceMin }),
    ...(filterPriceMax          && { price_max: filterPriceMax }),
    sort,
    per_page: 20,
  };

  const { data, isLoading, refetch, isRefetching } = useProducts(filters);
  const { data: wishlistItems = [] }               = useWishlist();
  const toggleWishlist                             = useToggleWishlist();

  const products    = Array.isArray(data?.data) ? data.data : [];
  const wishlistIds = new Set(wishlistItems.map((w) => w.product_id ?? w.id));

  const handleWishlist = useCallback(
    (product) =>
      toggleWishlist.mutate({ productId: product.id, isInWishlist: wishlistIds.has(product.id) }),
    [wishlistIds]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ width: ITEM_W }}>
        <ProductCard
          product={item}
          onPress={() => router.push(`/shop/${item.slug}`)}
          isInWishlist={wishlistIds.has(item.id)}
          onWishlistToggle={handleWishlist}
        />
      </View>
    ),
    [wishlistIds, handleWishlist]
  );

  // ── Filter modal ───────────────────────────────────────────────────────────

  const FilterModal = (
    <Modal
      visible={showFilter}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFilter(false)}
    >
      <View style={fs.overlay}>
        {/* tap backdrop to close */}
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowFilter(false)} />

        <View style={fs.sheet}>
          {/* drag handle */}
          <View style={fs.handle} />

          {/* header */}
          <View style={fs.sheetHeader}>
            <Text style={fs.sheetTitle}>{isArabic ? 'تصفية النتائج' : 'Filter Results'}</Text>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <Ionicons name="close" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

            {/* 1 — Categories */}
            <FilterSection title={isArabic ? 'الفئة' : 'Category'}>
              <View style={fs.pillRow}>
                {FILTER_CATS.map((cat) => {
                  const active = draftCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      onPress={() => setDraftCategory(cat.key)}
                      style={[fs.pill, active && fs.pillActive]}
                    >
                      <Text style={[fs.pillText, active && fs.pillTextActive]}>
                        {isArabic ? cat.ar : cat.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FilterSection>

            {/* 2 — Price */}
            <FilterSection title={isArabic ? 'السعر (د.أ)' : 'Price (JOD)'}>
              <View style={fs.priceRow}>
                <TextInput
                  style={fs.priceInput}
                  placeholder={isArabic ? 'الأدنى' : 'Min'}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={draftPriceMin}
                  onChangeText={setDraftPriceMin}
                />
                <Text style={fs.priceSep}>—</Text>
                <TextInput
                  style={fs.priceInput}
                  placeholder={isArabic ? 'الأعلى' : 'Max'}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={draftPriceMax}
                  onChangeText={setDraftPriceMax}
                />
              </View>
            </FilterSection>

            {/* 3 — Size */}
            <FilterSection title={isArabic ? 'المقاس' : 'Size'}>
              <View style={fs.pillRow}>
                {SIZES.map((size) => {
                  const active = draftSizes.includes(size);
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setDraftSizes(toggle(draftSizes, size))}
                      style={[fs.pill, active && fs.pillActive]}
                    >
                      <Text style={[fs.pillText, active && fs.pillTextActive]}>{size}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FilterSection>

            {/* 4 — Color */}
            <FilterSection title={isArabic ? 'اللون' : 'Color'}>
              <View style={fs.colorRow}>
                {COLORS.map((color) => {
                  const active = draftColors.includes(color.value);
                  return (
                    <TouchableOpacity
                      key={color.value}
                      onPress={() => setDraftColors(toggle(draftColors, color.value))}
                      title={isArabic ? color.ar : color.en}
                      style={[
                        fs.colorCircle,
                        { backgroundColor: color.hex },
                        color.border && { borderColor: theme.border },
                        active && { borderWidth: 3, borderColor: theme.accent },
                      ]}
                    />
                  );
                })}
              </View>
            </FilterSection>

            {/* 5 — Material */}
            <FilterSection title={isArabic ? 'المادة' : 'Material'}>
              {MATERIALS.map((mat) => {
                const active = draftMaterials.includes(mat.value);
                return (
                  <TouchableOpacity
                    key={mat.value}
                    onPress={() => setDraftMaterials(toggle(draftMaterials, mat.value))}
                    style={fs.checkRow}
                  >
                    <View style={[fs.checkbox, active && fs.checkboxActive]}>
                      {active && <Ionicons name="checkmark" size={11} color="#fff" />}
                    </View>
                    <Text style={[fs.checkLabel, active && { color: theme.accent }]}>
                      {isArabic ? mat.ar : mat.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </FilterSection>

            <View style={{ height: 8 }} />
          </ScrollView>

          {/* footer */}
          <View style={fs.footer}>
            <TouchableOpacity style={fs.clearBtn} onPress={clearDraft}>
              <Text style={fs.clearBtnText}>{isArabic ? 'مسح الكل' : 'Clear All'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={fs.applyBtn} onPress={applyFilters}>
              <Text style={fs.applyBtnText}>{isArabic ? 'تطبيق' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ── List header ────────────────────────────────────────────────────────────

  const ListHeader = (
    <View>
      {/* Search + Filter + Sort row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={handleSearchChange}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setDebouncedSearch(''); }}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter button */}
        <TouchableOpacity style={styles.filterBtn} onPress={openFilter}>
          <Ionicons name="options-outline" size={15} color={theme.textPrimary} />
          <Text style={styles.filterBtnText}>{isArabic ? 'تصفية' : 'Filter'}</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Sort button */}
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort((v) => !v)}>
          <Text style={styles.sortBtnText}>{isArabic ? 'ترتيب ▾' : 'Sort ▾'}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort dropdown */}
      {showSort && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortOpt, sort === opt.key && styles.sortOptActive]}
              onPress={() => { setSort(opt.key); setShowSort(false); }}
            >
              <Text style={[styles.sortOptText, sort === opt.key && styles.sortOptTextActive]}>
                {isArabic ? opt.ar : opt.en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category quick-chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {FILTER_CATS.map((chip) => (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, category === chip.key && styles.chipActive]}
            onPress={() => setCategory(chip.key)}
          >
            <Text style={[styles.chipText, category === chip.key && styles.chipTextActive]}>
              {isArabic ? chip.ar : chip.en}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {FilterModal}

      {isLoading && !products.length ? (
        <View>
          {ListHeader}
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />
          }
          ListEmptyComponent={!isLoading ? <EmptyState icon="👗" title={t('common.no_results')} /> : null}
        />
      )}
    </SafeAreaView>
  );
}

// ── Shop screen styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },

  searchRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: theme.textPrimary, height: 44 },

  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    paddingHorizontal: 10,
    height: 44,
  },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: theme.textPrimary },
  filterBadge: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  sortBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    paddingHorizontal: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortBtnText: { fontSize: 13, fontWeight: '600', color: theme.textPrimary },

  sortMenu: {
    marginHorizontal: 16,
    backgroundColor: theme.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    marginBottom: 4,
  },
  sortOpt:         { paddingHorizontal: 16, paddingVertical: 12 },
  sortOptActive:   { backgroundColor: theme.bg },
  sortOptText:     { fontSize: 14, color: theme.textPrimary },
  sortOptTextActive: { color: theme.accent, fontWeight: '600' },

  chipsRow:      { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 50, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface,
  },
  chipActive:     { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText:       { fontSize: 13, color: theme.textPrimary },
  chipTextActive: { color: theme.surface, fontWeight: '600' },

  listContent:   { paddingHorizontal: 16, paddingBottom: 24 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
  loadingWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
});

// ── Filter modal styles ──────────────────────────────────────────────────────

const fs = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginTop: 10, marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: theme.textPrimary },

  section: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: theme.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 50, borderWidth: 1.5, borderColor: theme.border,
    backgroundColor: 'transparent',
  },
  pillActive:     { backgroundColor: theme.accent, borderColor: theme.accent },
  pillText:       { fontSize: 13, color: theme.textPrimary, fontWeight: '500' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '600' },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceInput: {
    flex: 1, height: 44, borderRadius: 10,
    borderWidth: 1, borderColor: theme.border,
    backgroundColor: theme.bg,
    paddingHorizontal: 12,
    fontSize: 14, color: theme.textPrimary,
  },
  priceSep: { color: theme.textSecondary, fontSize: 14 },

  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'transparent',
  },

  checkRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 8,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: theme.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  checkLabel: { fontSize: 14, color: theme.textPrimary },

  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  clearBtn: {
    flex: 1, height: 52, borderRadius: 50,
    borderWidth: 1.5, borderColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  clearBtnText: { fontSize: 15, fontWeight: '600', color: theme.accent },
  applyBtn: {
    flex: 2, height: 52, borderRadius: 50,
    backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
