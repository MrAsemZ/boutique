import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/formatPrice';

const FALLBACK = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=600&fit=crop';

export default function ProductCard({ product, onPress, onWishlistToggle, isInWishlist, style }) {
  const { i18n } = useTranslation();
  const theme = useAppTheme();

  const displayName = product.display_name || product.name_ar || product.name || '';
  const displayPrice = product.sale_price
    ? parseFloat(product.sale_price)
    : parseFloat(product.base_price);
  const originalPrice = parseFloat(product.base_price);
  const hasSale =
    product.sale_price &&
    parseFloat(product.sale_price) < parseFloat(product.base_price);
  const brand = product.brand || '';

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.93}>
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.primary_image_url || FALLBACK }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Sale badge — top left */}
        {hasSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>
              {i18n.language === 'ar' ? 'خصم' : 'SALE'}
            </Text>
          </View>
        )}

        {/* Wishlist — top right */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => onWishlistToggle?.(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isInWishlist ? 'heart' : 'heart-outline'}
            size={16}
            color={isInWishlist ? '#E53E3E' : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        {!!brand && (
          <Text style={[styles.brand, { color: theme.textSecondary }]} numberOfLines={1}>
            {brand.toUpperCase()}
          </Text>
        )}
        <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.accent }]}>
            {formatPrice(displayPrice, i18n.language)}
          </Text>
          {hasSale && (
            <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
              {formatPrice(originalPrice, i18n.language)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageWrap: { position: 'relative', aspectRatio: 3 / 4 },
  image: { width: '100%', height: '100%' },
  saleBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#E53E3E',
    borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3,
  },
  saleBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  wishlistBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2,
    elevation: 1,
  },
  info:  { padding: 10, paddingTop: 8 },
  brand: { fontSize: 10, letterSpacing: 0.5, marginBottom: 3 },
  name:  { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  priceRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, flexWrap: 'wrap',
  },
  price:         { fontSize: 13, fontWeight: '700' },
  originalPrice: { fontSize: 11, textDecorationLine: 'line-through' },
});
