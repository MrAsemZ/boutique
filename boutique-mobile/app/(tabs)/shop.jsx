import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, RefreshControl, ScrollView, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useProducts } from '../../src/hooks/api/useProducts';
import { useCategories } from '../../src/hooks/api/useCategories';
import { useWishlist, useToggleWishlist } from '../../src/hooks/api/useWishlist';
import ProductCard from '../../src/components/ProductCard';
import EmptyState from '../../src/components/EmptyState';
import { useAppTheme, useSetTheme } from '../../src/context/ThemeContext';

const { width: SW } = Dimensions.get('window');
const ITEM_W = (SW - 16 * 2 - 12) / 2;

// ── Static filter data ────────────────────────────────────────────────────────

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const COLORS = [
  { value: 'black',  hex: '#1A1A1A', ar: 'أسود',  en: 'Black',  border: false },
  { value: 'white',  hex: '#F0F0F0', ar: 'أبيض',  en: 'White',  border: true  },
  { value: 'navy',   hex: '#1B2A4A', ar: 'كحلي',  en: 'Navy',   border: false },
  { value: 'gray',   hex: '#9CA3AF', ar: 'رمادي', en: 'Gray',   border: false },
  { value: 'red',    hex: '#EF4444', ar: 'أحمر',  en: 'Red',    border: false },
  { value: 'blue',   hex: '#3B82F6', ar: 'أزرق',  en: 'Blue',   border: false },
  { value: 'green',  hex: '#10B981', ar: 'أخضر',  en: 'Green',  border: false },
  { value: 'brown',  hex: '#92400E', ar: 'بني',   en: 'Brown',  border: false },
  { value: 'beige',  hex: '#D4B483', ar: 'بيج',   en: 'Beige',  border: false },
];

const MATERIALS = [
  { value: 'cotton',    ar: 'قطن',     en: 'Cotton'    },
  { value: 'polyester', ar: 'بوليستر', en: 'Polyester' },
  { value: 'wool',      ar: 'صوف',     en: 'Wool'      },
  { value: 'silk',      ar: 'حرير',    en: 'Silk'      },
  { value: 'linen',     ar: 'كتان',    en: 'Linen'     },
  { value: 'leather',   ar: 'جلد',     en: 'Leather'   },
];

const SORT_OPTIONS = [
  { key: 'newest',     ar: 'الأحدث',       en: 'Newest'             },
  { key: 'price_asc',  ar: 'السعر: الأقل',  en: 'Price: Low to High' },
  { key: 'price_desc', ar: 'السعر: الأعلى', en: 'Price: High to Low' },
  { key: 'popularity', ar: 'الأكثر مبيعاً', en: 'Most Popular'       },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

// FilterSection accepts styles from memoized fs object
function FilterSection({ title, children, sectionStyle, titleStyle }) {
  return (
    <View style={sectionStyle}>
      <Text style={titleStyle}>{title}</Text>
      {children}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ShopScreen() {
  const { t, i18n } = useTranslation();
  const router      = useRouter();
  const params      = useLocalSearchParams();
  const isArabic    = i18n.language === 'ar';

  const theme            = useAppTheme();
  const setThemeForCategory = useSetTheme();

  // Memoized styles — re-created only when theme object changes
  const styles = useMemo(() => createStyles(theme), [theme]);
  const fs     = useMemo(() => createFilterStyles(theme), [theme]);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category,        setCategory]        = useState(params.category || '');
  const [sizes,           setSizes]           = useState([]);
  const [colors,          setColors]          = useState([]);
  const [materials,       setMaterials]       = useState([]);
  const [priceMin,        setPriceMin]        = useState('');
  const [priceMax,        setPriceMax]        = useState('');
  const [sort,            setSort]            = useState('newest');
  const [inputPriceMin,   setInputPriceMin]   = useState('');
  const [inputPriceMax,   setInputPriceMax]   = useState('');

  useEffect(() => { setInputPriceMin(priceMin); }, [priceMin]);
  useEffect(() => { setInputPriceMax(priceMax); }, [priceMax]);

  const commitPrice = () => {
    setPriceMin(inputPriceMin);
    setPriceMax(inputPriceMax);
  };

  // Sync category from route params
  useEffect(() => {
    if (params.category) setCategory(params.category);
  }, [params.category]);

  // Update theme when category changes
  useEffect(() => {
    setThemeForCategory(category);
  }, [category]);

  const [showFilter, setShowFilter] = useState(false);
  const debounceRef = useRef(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeCount = [
    search,
    priceMin || priceMax,
    ...sizes,
    ...colors,
    ...materials,
    category,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setSizes([]);
    setColors([]);
    setMaterials([]);
    setPriceMin('');
    setPriceMax('');
    setSort('newest');
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 500);
  };

  // ── API ───────────────────────────────────────────────────────────────────
  const apiParams = {
    ...(debouncedSearch  && { search:    debouncedSearch }),
    ...(category         && { category }),
    ...(sizes.length     && { size:      sizes[0] }),
    ...(colors.length    && { color:     colors[0] }),
    ...(materials.length && { material:  materials[0] }),
    ...(priceMin         && { price_min: priceMin }),
    ...(priceMax         && { price_max: priceMax }),
    sort,
    per_page: 12,
  };

  const { data, isLoading, refetch, isRefetching } = useProducts(apiParams);
  const { data: categoriesData }                   = useCategories();
  const { data: wishlistItems = [] }               = useWishlist();
  const toggleWishlist                             = useToggleWishlist();

  const products   = Array.isArray(data?.data) ? data.data : [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Build category tree
  const catById = {};
  categories.forEach((c) => { catById[c.id] = { ...c, children: [] }; });
  const catRoots = [];
  categories.forEach((c) => {
    if (c.parent_id && catById[c.parent_id]) {
      catById[c.parent_id].children.push(catById[c.id]);
    } else if (catById[c.id]) {
      catRoots.push(catById[c.id]);
    }
  });

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const wishlistIds = new Set(wishlistItems.map((w) => w.product?.id));

  const handleWishlist = useCallback(
    (product) => {
      const wishlistItem      = wishlistItems.find((w) => w.product?.id === product.id);
      const isCurrentlyWished = !!wishlistItem;
      toggleWishlist.mutate({
        variantId:      product.first_variant_id,
        wishlistItemId: wishlistItem?.id,
        isInWishlist:   isCurrentlyWished,
      });
    },
    [wishlistItems]
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

  // ── Category item (used in drawer) ────────────────────────────────────────
  function CatItem({ cat, depth = 0 }) {
    const name     = cat.display_name || (isArabic ? cat.name_ar : cat.name) || cat.name;
    const isActive = category === cat.slug;
    return (
      <TouchableOpacity
        style={[
          fs.catRow,
          { paddingLeft: depth * 16 + 12 },
          isActive && fs.catRowActive,
        ]}
        onPress={() => setCategory(isActive ? '' : cat.slug)}
        activeOpacity={0.7}
      >
        <Text style={[fs.catLabel, isActive && fs.catLabelActive]}>{name}</Text>
        {isActive && <Ionicons name="checkmark" size={15} color={theme.accent} />}
      </TouchableOpacity>
    );
  }

  // ── Filter drawer ─────────────────────────────────────────────────────────
  const FilterDrawer = (
    <Modal
      visible={showFilter}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFilter(false)}
    >
      <View style={fs.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowFilter(false)} />
        <View style={fs.sheet}>
          <View style={fs.handle} />

          <View style={fs.sheetHeader}>
            <Text style={fs.sheetTitle}>
              {isArabic
                ? (activeCount > 0 ? `التصفية (${activeCount})` : 'التصفية')
                : (activeCount > 0 ? `Filters (${activeCount})` : 'Filters')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowFilter(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {activeCount > 0 && (
              <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
                <TouchableOpacity style={fs.clearAllBtn} onPress={clearFilters}>
                  <Ionicons name="close-circle-outline" size={15} color={theme.accent} />
                  <Text style={fs.clearAllText}>
                    {isArabic ? `مسح الكل (${activeCount})` : `Clear All (${activeCount})`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 1 — Search */}
            <FilterSection
              title={isArabic ? 'البحث' : 'Search'}
              sectionStyle={fs.section}
              titleStyle={fs.sectionTitle}
            >
              <View style={fs.searchWrap}>
                <Ionicons name="search-outline" size={17} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  style={fs.searchInput}
                  placeholder={isArabic ? 'ابحث عن منتج...' : 'Search products...'}
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={handleSearchChange}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearchChange('')}>
                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </FilterSection>

            {/* 2 — Sort */}
            <FilterSection
              title={isArabic ? 'الترتيب' : 'Sort By'}
              sectionStyle={fs.section}
              titleStyle={fs.sectionTitle}
            >
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={fs.sortOptRow}
                  onPress={() => setSort(opt.key)}
                >
                  <View style={[fs.radio, sort === opt.key && fs.radioActive]}>
                    {sort === opt.key && <View style={fs.radioDot} />}
                  </View>
                  <Text style={[fs.sortOptLabel, sort === opt.key && { color: theme.accent, fontWeight: '600' }]}>
                    {isArabic ? opt.ar : opt.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </FilterSection>

            {/* 3 — Categories */}
            {catRoots.length > 0 && (
              <FilterSection
                title={isArabic ? 'الفئات' : 'Categories'}
                sectionStyle={fs.section}
                titleStyle={fs.sectionTitle}
              >
                {catRoots.map((cat) => (
                  <View key={cat.id}>
                    <CatItem cat={cat} depth={0} />
                    {cat.children?.map((child) => (
                      <CatItem key={child.id} cat={child} depth={1} />
                    ))}
                  </View>
                ))}
              </FilterSection>
            )}

            {/* 4 — Price */}
            <FilterSection
              title={isArabic ? 'السعر (د.أ)' : 'Price (JOD)'}
              sectionStyle={fs.section}
              titleStyle={fs.sectionTitle}
            >
              <View style={fs.priceRow}>
                <TextInput
                  style={fs.priceInput}
                  placeholder={isArabic ? 'الأدنى' : 'Min'}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={inputPriceMin}
                  onChangeText={setInputPriceMin}
                  onEndEditing={commitPrice}
                />
                <Text style={fs.priceSep}>—</Text>
                <TextInput
                  style={fs.priceInput}
                  placeholder={isArabic ? 'الأعلى' : 'Max'}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={inputPriceMax}
                  onChangeText={setInputPriceMax}
                  onEndEditing={commitPrice}
                />
              </View>
              {(priceMin || priceMax) && (
                <Text style={fs.priceHint}>
                  {priceMin || '0'} {isArabic ? 'د.أ' : 'JOD'} — {priceMax || '∞'} {isArabic ? 'د.أ' : 'JOD'}
                </Text>
              )}
            </FilterSection>

            {/* 5 — Size */}
            <FilterSection
              title={isArabic ? 'المقاس' : 'Size'}
              sectionStyle={fs.section}
              titleStyle={fs.sectionTitle}
            >
              <View style={fs.pillRow}>
                {SIZES.map((size) => {
                  const active = sizes.includes(size);
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSizes(toggle(sizes, size))}
                      style={[fs.pill, active && fs.pillActive]}
                    >
                      <Text style={[fs.pillText, active && fs.pillTextActive]}>{size}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FilterSection>

            {/* 6 — Color */}
            <FilterSection
              title={isArabic ? 'اللون' : 'Color'}
              sectionStyle={fs.section}
              titleStyle={fs.sectionTitle}
            >
              <View style={fs.colorRow}>
                {COLORS.map((color) => {
                  const active = colors.includes(color.value);
                  return (
                    <TouchableOpacity
                      key={color.value}
                      onPress={() => setColors(toggle(colors, color.value))}
                      activeOpacity={0.8}
                    >
                      <View style={[fs.colorWrap, active && fs.colorWrapActive]}>
                        <View
                          style={[
                            fs.colorInner,
                            { backgroundColor: color.hex },
                            color.border && fs.colorInnerBorder,
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FilterSection>

            {/* 7 — Material */}
            <FilterSection
              title={isArabic ? 'المادة' : 'Material'}
              sectionStyle={fs.section}
              titleStyle={fs.sectionTitle}
            >
              {MATERIALS.map((mat) => {
                const active = materials.includes(mat.value);
                return (
                  <TouchableOpacity
                    key={mat.value}
                    onPress={() => setMaterials(toggle(materials, mat.value))}
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

          <View style={fs.footer}>
            <TouchableOpacity style={fs.applyBtn} onPress={() => setShowFilter(false)}>
              <Text style={fs.applyBtnText}>
                {isArabic ? 'تطبيق الفلاتر' : 'Apply Filters'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ── List header ───────────────────────────────────────────────────────────

  const ListHeader = (
    <View>
      <View style={styles.shopHeader}>
        <Text style={styles.shopLogo}>Boutique</Text>
      </View>
      {catRoots.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <TouchableOpacity
            style={[styles.chip, !category && styles.chipActive]}
            onPress={() => setCategory('')}
          >
            <Text style={[styles.chipText, !category && styles.chipTextActive]}>
              {isArabic ? 'الكل' : 'All'}
            </Text>
          </TouchableOpacity>
          {catRoots.map((cat) => {
            const name = cat.display_name || (isArabic ? cat.name_ar : cat.name) || cat.name;
            const isActive = category === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setCategory(isActive ? '' : cat.slug)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {FilterDrawer}

      {isLoading && !products.length ? (
        <View style={{ flex: 1 }}>
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

      {/* Floating filter button */}
      <View pointerEvents="box-none" style={styles.floatingWrap}>
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => setShowFilter(true)}
          activeOpacity={0.88}
        >
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
          <Text style={styles.floatingBtnText}>
            {isArabic
              ? (activeCount > 0 ? `الفلاتر (${activeCount})` : 'الفلاتر')
              : (activeCount > 0 ? `Filters (${activeCount})` : 'Filters')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Style creators ─────────────────────────────────────────────────────────────

function createStyles(theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bg },

    shopHeader: {
      alignItems: 'center', paddingVertical: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    shopLogo: {
      fontSize: 24, fontWeight: '700',
      color: theme.accent, letterSpacing: -0.5,
    },

    chipsRow:      { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    chip: {
      paddingHorizontal: 16, paddingVertical: 7,
      borderRadius: 50, borderWidth: 1, borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    chipActive:     { backgroundColor: theme.accent, borderColor: theme.accent },
    chipText:       { fontSize: 13, color: theme.textPrimary },
    chipTextActive: { color: '#FFFFFF', fontWeight: '600' },

    listContent:   { paddingHorizontal: 16, paddingBottom: 96 },
    columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
    loadingWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },

    floatingWrap: {
      position: 'absolute', bottom: 24, left: 0, right: 0,
      alignItems: 'center',
    },
    floatingBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: theme.accent,
      paddingHorizontal: 28, paddingVertical: 13,
      borderRadius: 50,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 12,
      elevation: 8,
    },
    floatingBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  });
}

function createFilterStyles(theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 16, borderTopRightRadius: 16,
      height: '82%', paddingBottom: 24,
    },
    handle: {
      width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB',
      alignSelf: 'center', marginTop: 10, marginBottom: 6,
    },
    sheetHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    sheetTitle: { fontSize: 17, fontWeight: '700', color: theme.textPrimary },

    clearAllBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingVertical: 9, paddingHorizontal: 16, borderRadius: 50,
      borderWidth: 1, borderColor: theme.accent, marginBottom: 4,
    },
    clearAllText: { fontSize: 13, fontWeight: '600', color: theme.accent },

    section: {
      paddingHorizontal: 20, paddingVertical: 16,
      borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    sectionTitle: {
      fontSize: 12, fontWeight: '700', color: theme.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14,
    },

    searchWrap: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#F3F4F6', borderRadius: 10,
      paddingHorizontal: 12, height: 44,
    },
    searchInput: { flex: 1, fontSize: 14, color: theme.textPrimary, height: 44 },

    catRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 9, paddingRight: 8,
      borderLeftWidth: 2, borderLeftColor: 'transparent',
      borderRadius: 6, marginBottom: 2,
    },
    catRowActive:   { borderLeftColor: theme.accent, backgroundColor: theme.bg },
    catLabel:       { fontSize: 14, color: theme.textPrimary },
    catLabelActive: { color: theme.accent, fontWeight: '600' },

    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    priceInput: {
      flex: 1, height: 44, borderRadius: 8,
      borderWidth: 1, borderColor: '#D1D5DB',
      backgroundColor: '#FFFFFF', paddingHorizontal: 12,
      fontSize: 14, color: theme.textPrimary,
    },
    priceSep:  { color: theme.textSecondary, fontSize: 16 },
    priceHint: { fontSize: 12, color: theme.textSecondary, marginTop: 6 },

    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: {
      paddingHorizontal: 14, paddingVertical: 6,
      borderRadius: 50, borderWidth: 1.5, borderColor: theme.border,
    },
    pillActive:     { backgroundColor: theme.accent, borderColor: theme.accent },
    pillText:       { fontSize: 13, color: theme.textSecondary, fontWeight: '500' },
    pillTextActive: { color: '#FFFFFF', fontWeight: '700' },

    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    colorWrap: { borderRadius: 18, borderWidth: 2, borderColor: 'transparent', padding: 2 },
    colorWrapActive: { borderColor: theme.accent },
    colorInner: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent' },
    colorInnerBorder: { borderColor: '#D1D5DB' },

    sortOptRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
    radio: {
      width: 18, height: 18, borderRadius: 9,
      borderWidth: 1.5, borderColor: theme.border,
      backgroundColor: '#FFFFFF',
      alignItems: 'center', justifyContent: 'center',
    },
    radioActive: { borderColor: theme.accent },
    radioDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent },
    sortOptLabel: { fontSize: 14, color: theme.textPrimary },

    checkRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
    checkbox: {
      width: 18, height: 18, borderRadius: 4,
      borderWidth: 1.5, borderColor: theme.border,
      backgroundColor: '#FFFFFF',
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: theme.accent, borderColor: theme.accent },
    checkLabel:     { fontSize: 14, color: theme.textSecondary },

    footer: {
      paddingHorizontal: 20, paddingTop: 14,
      borderTopWidth: 1, borderTopColor: '#F3F4F6',
    },
    applyBtn: {
      height: 52, borderRadius: 50,
      backgroundColor: theme.accent,
      alignItems: 'center', justifyContent: 'center',
    },
    applyBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  });
}
