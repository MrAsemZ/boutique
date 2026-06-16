import {
  View, Text, ScrollView, Image, ImageBackground, TouchableOpacity,
  StyleSheet, Dimensions, I18nManager, Animated, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef } from 'react';
import { useFeaturedProducts, useProducts } from '../../src/hooks/api/useProducts';
import { useWishlist, useToggleWishlist } from '../../src/hooks/api/useWishlist';
import ProductCard from '../../src/components/ProductCard';
import useCartStore from '../../src/stores/cartStore';
import { useAppTheme, useSetTheme } from '../../src/context/ThemeContext';
import { changeLanguage } from '../../src/i18n/index';
import { SCREEN_PADDING, SECTION_SPACING } from '../../src/theme/styles';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - SCREEN_PADDING * 2 - 12) / 2;

const CATEGORIES = [
  { slug: 'men',         en: 'Men',         ar: 'رجال',       image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=300&fit=crop' },
  { slug: 'women',       en: 'Women',       ar: 'نساء',       image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
  { slug: 'kids',        en: 'Kids',        ar: 'أطفال',      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=300&fit=crop' },
  { slug: 'accessories', en: 'Accessories', ar: 'إكسسوارات', image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&h=300&fit=crop' },
];

function CategoryCard({ cat, isArabic, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 50 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.categoryCard, { transform: [{ scale }] }]}>
        <ImageBackground
          source={{ uri: cat.image }}
          style={styles.categoryImage}
          imageStyle={{ borderRadius: 14 }}
        >
          <View style={styles.categoryOverlay}>
            <Text style={styles.categoryName}>{isArabic ? cat.ar : cat.en}</Text>
            <Ionicons name={isArabic ? 'arrow-back' : 'arrow-forward'} size={16} color="#FFFFFF" />
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

function SectionHeader({ title, onSeeAll }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
        <View style={[styles.sectionUnderline, { backgroundColor: theme.accent }]} />
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: theme.accent }]}>{t('common.see_all')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const setThemeForCategory = useSetTheme();
  const itemCount = useCartStore((s) => s.itemCount);
  const isArabic = i18n.language === 'ar';

  // Reset to default theme whenever home tab gains focus
  useFocusEffect(
    useCallback(() => {
      setThemeForCategory('');
    }, [setThemeForCategory])
  );

  const { data: featuredRaw } = useFeaturedProducts();
  const { data: newArrivalsRaw } = useProducts({ sort: 'newest', per_page: 8 });

  const featured    = Array.isArray(featuredRaw)          ? featuredRaw          : [];
  const newArrivals = Array.isArray(newArrivalsRaw?.data) ? newArrivalsRaw.data  : [];

  const { data: wishlistItems = [] } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const wishlistIds = new Set(wishlistItems.map((w) => w.product?.id));

  const handleWishlist = (product) => {
    const wishlistItem      = wishlistItems.find((w) => w.product?.id === product.id);
    const isCurrentlyWished = !!wishlistItem;
    toggleWishlist.mutate({
      variantId:      product.first_variant_id,
      wishlistItemId: wishlistItem?.id,
      isInWishlist:   isCurrentlyWished,
    });
  };

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
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* Announcement bar */}
      <View style={[styles.announcementBar, { backgroundColor: theme.accent }]}>
        <Text style={styles.announcementText} numberOfLines={1}>
          {isArabic
            ? '🎉 شحن مجاني على الطلبات فوق 100 د.أ | كود WELCOME20 لخصم 20%'
            : '🎉 Free shipping over JOD 100 | Code WELCOME20 for 20% off'}
        </Text>
      </View>

      {/* Decorative blob — top-right corner, very faint */}
      <View
        style={[styles.decorBlobTop, { backgroundColor: theme.accent }]}
        pointerEvents="none"
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.textPrimary }]}>Boutique</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/shop')}>
              <Ionicons name="search-outline" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.langBtn} onPress={handleLang}>
              <Text style={[styles.langText, { color: theme.textPrimary }]}>
                {i18n.language === 'ar' ? 'EN' : 'عر'}
              </Text>
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

        {/* ── Hero — taller, cinematic ── */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Top vignette */}
          <View style={styles.heroTopOverlay} />
          {/* Bottom gradient for text */}
          <View style={styles.heroBottomGradient} />
          {/* Content pinned to bottom */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              {isArabic ? 'أناقتك تبدأ هنا' : 'Style Starts Here'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isArabic
                ? 'اكتشف الأزياء التي تعبر عن أسلوبك'
                : 'Discover fashion that speaks your style'}
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push('/(tabs)/shop')}
            >
              <Text style={[styles.heroBtnText, { color: theme.textPrimary }]}>
                {isArabic ? 'تسوق الآن' : 'Shop Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Categories — 2×2 grid ── */}
        <View style={{ marginTop: SECTION_SPACING }}>
          <View style={styles.section}>
            <SectionHeader title={isArabic ? 'تسوق حسب الفئة' : 'Shop by Category'} />
          </View>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.slug}
                cat={cat}
                isArabic={isArabic}
                onPress={() => {
                  setThemeForCategory(cat.slug);
                  router.push({ pathname: '/(tabs)/shop', params: { category: cat.slug } });
                }}
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

        {/* ── New Arrivals — surface card block ── */}
        {newArrivals.length > 0 && (
          <View style={[styles.newArrivalsBlock, { backgroundColor: theme.surface }]}>
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
  safe:          { flex: 1 },
  scrollContent: { flexGrow: 1 },

  announcementBar: {
    height: 36, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 12,
  },
  announcementText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // Decorative blob — top-right, partially off-screen, very faint
  decorBlobTop: {
    position: 'absolute',
    width: 280, height: 280, borderRadius: 140,
    top: -120, right: -80,
    opacity: 0.06, zIndex: 0,
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING, paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0EDE8',
  },
  logo:        { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  langBtn: {
    borderWidth: 1, borderColor: '#E5E0D8', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  langText:      { fontSize: 11, fontWeight: '700' },
  cartBadge: {
    position: 'absolute', top: -5, right: -7,
    backgroundColor: '#E53E3E', borderRadius: 10,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },

  // Hero — taller + cinematic gradient frame
  heroWrap: {
    marginHorizontal: SCREEN_PADDING, marginTop: 16,
    height: 280, borderRadius: 20, overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  heroTopOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 70,
    backgroundColor: 'rgba(0,0,0,0.14)',
  },
  heroBottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 170,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 32, fontWeight: '800', color: '#FFF',
    marginBottom: 6, letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)', fontSize: 14,
    fontWeight: '500', marginBottom: 18,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF', borderRadius: 50,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  heroBtnText: { fontSize: 14, fontWeight: '700' },

  section: { paddingHorizontal: SCREEN_PADDING },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sectionTitle:     { fontSize: 18, fontWeight: '700' },
  sectionUnderline: { width: 28, height: 3, borderRadius: 2, marginTop: 4 },
  seeAll:           { fontSize: 13, fontWeight: '600' },
  hRow:             { paddingRight: 4 },

  // Category 2×2 grid
  categoriesGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', paddingHorizontal: 16,
  },
  categoryCard: {
    width: (SW - 32 - 12) / 2, height: 155,
    borderRadius: 14, overflow: 'hidden', marginBottom: 12,
  },
  categoryImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  categoryOverlay: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.38)',
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
  },
  categoryName: {
    color: '#FFFFFF', fontSize: 15, fontWeight: '700',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  // New Arrivals — subtle surface card on bg
  newArrivalsBlock: {
    marginTop: SECTION_SPACING,
    paddingTop: 20, paddingBottom: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});
