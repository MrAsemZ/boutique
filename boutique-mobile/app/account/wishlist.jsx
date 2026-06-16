import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { useWishlist, useRemoveFromWishlist } from '../../src/hooks/api/useWishlist';
import ProductCard from '../../src/components/ProductCard';
import LoadingScreen from '../../src/components/LoadingScreen';
import { useAppTheme } from '../../src/context/ThemeContext';
const { width: SW } = Dimensions.get('window');
const ITEM_W = (SW - 16 * 2 - 12) / 2;

export default function WishlistScreen() {
  const { t, i18n } = useTranslation();
  const router   = useRouter();
  const theme    = useAppTheme();
  const isArabic = i18n.language === 'ar';

  const { data: wishlistItems = [], isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Deduplicate by product id — same product saved in multiple sizes shows once
  const uniqueWishlistItems = [];
  const seenProductIds = new Set();
  for (const item of wishlistItems) {
    const productId = item.product?.id;
    if (productId && !seenProductIds.has(productId)) {
      seenProductIds.add(productId);
      uniqueWishlistItems.push(item);
    }
  }

  // Build flat objects the ProductCard expects, keeping the wishlist item id for removal
  const items = uniqueWishlistItems.map((w) => ({
    wishlistItemId: w.id,
    product: {
      ...w.product,
      _variantSize:  w.variant?.size,
      _variantColor: w.variant?.color,
    },
  }));

  const handleRemove = useCallback((product) => {
    // ProductCard calls onWishlistToggle(product) — find matching wishlist item
    const entry = wishlistItems.find((w) => w.product?.id === product.id);
    if (entry) removeFromWishlist.mutate(entry.id);
  }, [wishlistItems]);

  const renderItem = useCallback(({ item }) => (
    <View style={{ width: ITEM_W }}>
      <ProductCard
        product={item.product}
        onPress={() => router.push(`/shop/${item.product.slug}`)}
        isInWishlist={true}
        onWishlistToggle={handleRemove}
      />
    </View>
  ), [handleRemove]);

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('account.wishlist')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {isArabic ? 'قائمة مفضلتك فارغة' : 'Your wishlist is empty'}
          </Text>
          <Text style={styles.emptySub}>
            {isArabic
              ? 'أضف المنتجات التي تعجبك هنا'
              : 'Save items you love for later'}
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.replace('/(tabs)/shop')}
          >
            <Text style={styles.browseBtnText}>
              {isArabic ? 'تصفح المنتجات' : 'Browse Products'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.wishlistItemId)}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0EDE8',
  },
  backBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },

  list: { padding: 16, paddingBottom: 40 },
  row:  { justifyContent: 'space-between', marginBottom: 12 },

  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  emptySub:   { fontSize: 14, color: '#6B6B6B', textAlign: 'center' },
  browseBtn: {
    marginTop: 8, backgroundColor: '#2D2D2D', borderRadius: 50,
    height: 52, paddingHorizontal: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  browseBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
