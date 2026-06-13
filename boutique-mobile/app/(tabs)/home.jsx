import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFeaturedProducts, useProducts } from '../../src/hooks/api/useProducts';
import { useWishlist, useToggleWishlist } from '../../src/hooks/api/useWishlist';
import ProductCard from '../../src/components/ProductCard';
import useCartStore from '../../src/stores/cartStore';
import { themes } from '../../src/theme/colors';
import { changeLanguage } from '../../src/i18n/index';
import { SCREEN_PADDING, SECTION_SPACING } from '../../src/theme/styles';

const theme = themes.default;
const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - SCREEN_PADDING * 2 - 12) / 2;
const CAT_W  = (SW - SCREEN_PADDING * 2 - 12) / 2;

const CATEGORIES = [
  { slug: 'men',         en: 'Men',         ar: 'رجال',        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=300&fit=crop' },
  { slug: 'women',       en: 'Women',       ar: 'نساء',        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
  { slug: 'kids',        en: 'Kids',        ar: 'أطفال',       image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=300&fit=crop' },
  { slug: 'accessories', en: 'Accessories', ar: 'إكسسوارات',  image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&h=300&fit=crop' },
];

function CategoryCard({ cat, isArabic, onPress }) {
  return (
    <TouchableOpacity style={[styles.catCard, { width: CAT_W }]} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri: cat.image }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      {/* light tint over whole card */}
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' }} />
      {/* dark band at bottom simulating gradient */}
      <View style={styles.catGradient} />
      <View style={styles.catTextWrap}>
        <Text style={styles.catName}>{isArabic ? cat.ar : cat.en}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, onSeeAll }) {
  const { t } = useTranslation();
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>{t('common.see_all')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.itemCount);
  const isArabic = i18n.language === 'ar';

  const { data: featuredRaw } = useFeaturedProducts();
  const { data: newArrivalsRaw } = useProducts({ sort: 'newest', per_page: 8 });

  const featured    = Array.isArray(featuredRaw)         ? featuredRaw         : [];
  const newArrivals = Array.isArray(newArrivalsRaw?.data) ? newArrivalsRaw.data : [];

  const { data: wishlistItems = [] } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const wishlistIds = new Set(wishlistItems.map((w) => w.product_id ?? w.id));

  const handleWishlist = (product) =>
    toggleWishlist.mutate({ productId: product.id, isInWishlist: wishlistIds.has(product.id) });

  const handleLang = async () => {
    await changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const renderGrid = (products) => {
    const rows = [];
    for (let i = 0; i < products.length; i += 2) {
      rows.push(
        <View key={i} style={styles.gridRow}>
          <View style={{ width: CARD_W }}>
            <ProductCard
              product={products[i]}
              onPress={() => router.push(`/shop/${products[i].slug}`)}
              isInWishlist={wishlistIds.has(products[i].id)}
              onWishlistToggle={handleWishlist}
            />
          </View>
          {products[i + 1] ? (
            <View style={{ width: CARD_W }}>
              <ProductCard
                product={products[i + 1]}
                onPress={() => router.push(`/shop/${products[i + 1].slug}`)}
                isInWishlist={wishlistIds.has(products[i + 1].id)}
                onWishlistToggle={handleWishlist}
              />
            </View>
          ) : (
            <View style={{ width: CARD_W }} />
          )}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.logo}>Boutique</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.langBtn} onPress={handleLang}>
              <Text style={styles.langText}>{i18n.language === 'ar' ? 'EN' : 'عر'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
              <View>
                <Ionicons name="bag-outline" size={24} color={theme.textPrimary} />
                {itemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{itemCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero ── */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{t('home.discover')}</Text>
            <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/(tabs)/shop')}>
              <Text style={styles.heroBtnText}>{t('home.shop_now')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Categories — 2×2 grid ── */}
        <View style={[styles.section, { marginTop: SECTION_SPACING }]}>
          <SectionHeader
            title={isArabic ? 'تسوق حسب الفئة' : 'Shop by Category'}
          />
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.slug}
                cat={cat}
                isArabic={isArabic}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/shop', params: { category: cat.slug } })
                }
              />
            ))}
          </View>
        </View>

        {/* ── Featured ── */}
        {featured.length > 0 && (
          <View style={[styles.section, { marginTop: SECTION_SPACING }]}>
            <SectionHeader
              title={isArabic ? 'منتجات مميزة' : 'Featured Products'}
              onSeeAll={() => router.push('/(tabs)/shop')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hRow}
            >
              {featured.map((p) => (
                <View key={p.id} style={{ width: 160, marginRight: 12 }}>
                  <ProductCard
                    product={p}
                    onPress={() => router.push(`/shop/${p.slug}`)}
                    isInWishlist={wishlistIds.has(p.id)}
                    onWishlistToggle={handleWishlist}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── New Arrivals — subtle tinted block ── */}
        {newArrivals.length > 0 && (
          <View style={styles.newArrivalsBlock}>
            <View style={styles.section}>
              <SectionHeader
                title={isArabic ? 'وصل حديثاً' : 'New Arrivals'}
                onSeeAll={() => router.push('/(tabs)/shop')}
              />
              <View>{renderGrid(newArrivals)}</View>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: theme.bg },
  scrollContent: { flexGrow: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDE8',
  },
  logo:        { fontSize: 22, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  langBtn: {
    borderWidth: 1, borderColor: '#E5E0D8', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  langText:      { fontSize: 11, fontWeight: '700', color: theme.textPrimary },
  cartBadge: {
    position: 'absolute', top: -5, right: -7,
    backgroundColor: '#E53E3E', borderRadius: 10,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },

  heroWrap: {
    marginHorizontal: SCREEN_PADDING, marginTop: 16,
    height: 220, borderRadius: 16, overflow: 'hidden',
  },
  heroImage:   { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 26, fontWeight: '700', color: '#FFF',
    marginBottom: 20, textAlign: 'center', letterSpacing: -0.3,
  },
  heroBtn:     { backgroundColor: '#FFF', borderRadius: 50, paddingHorizontal: 28, paddingVertical: 11 },
  heroBtnText: { color: theme.textPrimary, fontSize: 14, fontWeight: '700' },

  section: { paddingHorizontal: SCREEN_PADDING },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.textPrimary },
  seeAll:       { fontSize: 13, color: theme.accent, fontWeight: '600' },
  hRow:         { paddingRight: 4 },

  // Category 2×2 grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: { height: 160, borderRadius: 12, overflow: 'hidden' },
  catGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  catTextWrap: { position: 'absolute', bottom: 14, left: 14, right: 14 },
  catName:     { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },

  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  // New Arrivals subtle tinted background block
  newArrivalsBlock: {
    backgroundColor: '#FCFBF9',
    marginTop: SECTION_SPACING,
    paddingTop: 20,
    paddingBottom: 8,
  },
});
