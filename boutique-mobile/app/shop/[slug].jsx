import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useLayoutEffect } from 'react';
import { useProduct } from '../../src/hooks/api/useProducts';
import { useAddToCart } from '../../src/hooks/api/useCart';
import { useWishlist, useToggleWishlist } from '../../src/hooks/api/useWishlist';
import useAuthStore from '../../src/stores/authStore';
import useCartStore from '../../src/stores/cartStore';
import LoadingScreen from '../../src/components/LoadingScreen';
import ErrorScreen from '../../src/components/ErrorScreen';
import { useAppTheme, useSetTheme } from '../../src/context/ThemeContext';
import { formatPrice } from '../../src/utils/formatPrice';

const { width: SW } = Dimensions.get('window');
const FALLBACK = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=800&fit=crop';

const COLOR_MAP = {
  black: '#1a1a1a', white: '#f5f5f5', navy: '#1B2A4A', gray: '#9CA3AF',
  grey: '#9CA3AF', red: '#EF4444', blue: '#3B82F6', green: '#10B981',
  brown: '#92400E', beige: '#D4B483', rose: '#FDA4AF', pink: '#F9A8D4',
  yellow: '#FCD34D', orange: '#FB923C', purple: '#A855F7', indigo: '#6366F1',
  denim: '#1560BD', cream: '#FFFDD0', khaki: '#C3B091', olive: '#6B7C3D',
  maroon: '#800000', teal: '#008080', coral: '#FF6B6B',
};
const getHex = (c) => (c ? (COLOR_MAP[c.toLowerCase().trim()] ?? '#9CA3AF') : '#9CA3AF');

export default function ProductDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const isArabic = i18n.language === 'ar';

  const theme            = useAppTheme();
  const setThemeForCategory = useSetTheme();
  const styles           = useMemo(() => createStyles(theme), [theme]);

  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const addToCartMutation = useAddToCart();
  const { data: wishlistItems = [] } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [selectedSize,  setSelectedSize]  = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity,      setQuantity]      = useState(1);
  const [descExpanded,  setDescExpanded]  = useState(false);

  // Apply category theme when product data arrives
  useLayoutEffect(() => {
    if (product?.category?.slug) {
      setThemeForCategory(product.category.slug);
    }
  }, [product?.category?.slug]);

  if (isLoading) return <LoadingScreen />;
  if (isError || !product) return <ErrorScreen onRetry={refetch} />;

  // Variant extraction
  const allVariants = Object.entries(product.variants_grouped || {}).flatMap(([size, vs]) =>
    vs.map((v) => ({ ...v, size }))
  );
  const uniqueSizes    = [...new Set(allVariants.map((v) => v.size))];
  const sizeInStock    = {};
  uniqueSizes.forEach((sz) => {
    sizeInStock[sz] = allVariants.some((v) => v.size === sz && v.stock > 0);
  });
  const colorsForSize  = selectedSize ? allVariants.filter((v) => v.size === selectedSize) : [];
  const selectedVariant =
    selectedSize && selectedColor
      ? allVariants.find((v) => v.size === selectedSize && v.color === selectedColor)
      : null;

  const stock        = selectedVariant?.stock ?? null;
  const isOutOfStock = stock === 0;

  const wishlistItem = selectedVariant
    ? wishlistItems.find((w) => w.variant?.id === selectedVariant.id)
    : wishlistItems.find((w) => w.product?.id === product.id);
  const isInWishlist = !!wishlistItem;

  const displayName   = product.display_name || product.name_ar || product.name || '';
  const displayPrice  = product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.base_price);
  const originalPrice = parseFloat(product.base_price);
  const isOnSale      = product.sale_price && parseFloat(product.sale_price) < originalPrice;
  const discountPct   = isOnSale ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  const image = (product.images && product.images[0]?.url) || product.primary_image_url || FALLBACK;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      Alert.alert('', t('product.select_size') + ' / ' + t('product.select_color'));
      return;
    }
    if (isAuthenticated) {
      addToCartMutation.mutate(
        { variant_id: selectedVariant.id, quantity },
        {
          onSuccess: () => Alert.alert('', t('product.added_to_cart')),
          onError:   (e) => Alert.alert('', e.response?.data?.message || t('common.error')),
        }
      );
    } else {
      const store    = useCartStore.getState();
      const existing = store.items.find((i) => i.variant_id === selectedVariant.id);
      const newItems = existing
        ? store.items.map((i) =>
            i.variant_id === selectedVariant.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [
            ...store.items,
            {
              id: Date.now(), variant_id: selectedVariant.id, product_id: product.id,
              name: displayName, image: product.primary_image_url,
              price: selectedVariant.price || product.base_price,
              size: selectedVariant.size, color: selectedVariant.color, quantity,
            },
          ];
      const itemCount = newItems.reduce((s, i) => s + i.quantity, 0);
      const subtotal  = newItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
      store.setCart({ items: newItems, item_count: itemCount, subtotal });
      store.saveGuestCart();
      Alert.alert('', t('product.added_to_cart'));
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    const variantId = selectedVariant?.id ?? product.first_variant_id;
    if (!variantId) return;
    toggleWishlist.mutate({ variantId, wishlistItemId: wishlistItem?.id, isInWishlist });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setSelectedColor(null);
    setQuantity(1);
  };

  const addBtnLabel = isOutOfStock
    ? (isArabic ? 'غير متوفر' : 'Out of Stock')
    : addToCartMutation.isPending
      ? (isArabic ? 'جارٍ...' : 'Adding...')
      : t('product.add_to_cart');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Floating back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={22} color={theme.textPrimary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product image */}
        <View>
          <Image source={{ uri: image }} style={styles.heroImage} resizeMode="cover" />
          {/* Bottom fade — layered to simulate a smooth gradient into themed background */}
          <View style={styles.imageFadeWrap} pointerEvents="none">
            <View style={[styles.fadeStep, { backgroundColor: theme.bg, opacity: 0.12 }]} />
            <View style={[styles.fadeStep, { backgroundColor: theme.bg, opacity: 0.3 }]} />
            <View style={[styles.fadeStep, { backgroundColor: theme.bg, opacity: 0.6 }]} />
            <View style={[styles.fadeStep, { backgroundColor: theme.bg, opacity: 1 }]} />
          </View>
        </View>

        {/* Floating info card — overlaps the image bottom for a premium card-stack feel */}
        <View style={styles.content}>
          {/* Brand badge */}
          {product.brand ? (
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>{product.brand}</Text>
            </View>
          ) : null}

          {/* Name */}
          <Text style={styles.name}>{displayName}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(displayPrice, i18n.language)}</Text>
            {isOnSale && (
              <>
                <Text style={styles.originalPrice}>{formatPrice(originalPrice, i18n.language)}</Text>
                <View style={styles.saleBadge}>
                  <Text style={styles.saleBadgeText}>−{discountPct}%</Text>
                </View>
              </>
            )}
          </View>

          {/* Stock */}
          {selectedVariant && (
            <Text style={[styles.stock, selectedVariant.stock > 0 ? styles.inStock : styles.outStock]}>
              {selectedVariant.stock > 0
                ? `✓ ${isArabic ? 'متوفر' : 'In Stock'} (${selectedVariant.stock})`
                : `✗ ${isArabic ? 'غير متوفر' : 'Out of Stock'}`}
            </Text>
          )}

          {/* Description */}
          {product.description ? (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>{t('product.description')}</Text>
              <Text style={styles.descText} numberOfLines={descExpanded ? undefined : 3}>
                {product.description}
              </Text>
              <TouchableOpacity onPress={() => setDescExpanded((v) => !v)}>
                <Text style={styles.descToggle}>
                  {descExpanded ? (isArabic ? 'أقل' : 'Show less') : (isArabic ? 'اقرأ المزيد' : 'Read more')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Size selector */}
          {uniqueSizes.length > 0 && (
            <View style={styles.selectorSection}>
              <View style={styles.selectorHeaderRow}>
                <Text style={styles.selectorLabel}>{isArabic ? 'المقاس' : 'Size'}</Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert('', isArabic ? 'دليل المقاسات قريباً' : 'Size guide coming soon')
                  }
                >
                  <Text style={styles.sizeGuideLink}>
                    {isArabic ? 'دليل المقاسات' : 'Size Guide'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pillRow}>
                {uniqueSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const inStock    = sizeInStock[size];
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizePill,
                        isSelected && styles.sizePillActive,
                        !inStock && styles.sizePillOOS,
                      ]}
                      onPress={() => inStock && handleSizeChange(size)}
                      disabled={!inStock}
                    >
                      <Text style={[
                        styles.sizePillText,
                        isSelected && styles.sizePillTextActive,
                        !inStock && styles.sizePillTextOOS,
                      ]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Color swatches */}
          {colorsForSize.length > 0 && (
            <View style={styles.selectorSection}>
              <Text style={styles.selectorLabel}>
                {isArabic ? 'اللون' : 'Color'}
                {selectedColor ? (
                  <Text style={{ fontWeight: '400', color: theme.textSecondary }}>
                    {' — '}{selectedColor}
                  </Text>
                ) : null}
              </Text>
              <View style={styles.colorRow}>
                {colorsForSize.map((v) => {
                  const isSelected = selectedColor === v.color;
                  const hex = v.color_hex || getHex(v.color);
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.colorCircle, { backgroundColor: hex }, isSelected && styles.colorCircleActive]}
                      onPress={() => setSelectedColor(v.color)}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity */}
          {!isOutOfStock && (
            <View style={styles.selectorSection}>
              <Text style={styles.selectorLabel}>{isArabic ? 'الكمية' : 'Quantity'}</Text>
              <View style={styles.qtyPill}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Text style={[styles.qtyBtnText, quantity <= 1 && styles.qtyBtnDisabled]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((q) => Math.min(q + 1, stock ?? 10))}
                  disabled={stock !== null && quantity >= stock}
                >
                  <Text style={[styles.qtyBtnText, stock !== null && quantity >= stock && styles.qtyBtnDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* Fixed bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.wishlistBtn, isInWishlist && styles.wishlistBtnActive]}
          onPress={handleWishlist}
        >
          <Ionicons
            name={isInWishlist ? 'heart' : 'heart-outline'}
            size={22}
            color={isInWishlist ? '#E53E3E' : theme.accent}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={addToCartMutation.isPending || isOutOfStock}
        >
          {addToCartMutation.isPending
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.addBtnText}>{addBtnLabel}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Style creator ─────────────────────────────────────────────────────────────

function createStyles(theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bg },

    backBtn: {
      position: 'absolute', top: 12, left: 16, zIndex: 10,
      backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 22,
      width: 40, height: 40,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },

    heroImage: { width: SW, height: 420 },
    // Layered fade blends image into themed background
    imageFadeWrap: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
      flexDirection: 'column',
    },
    fadeStep: { flex: 1 },

    // Floating card — overlaps the image bottom edge
    content: {
      backgroundColor: theme.surface,
      marginTop: -20,
      borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 20,
      shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },

    brandBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.bg,
      borderRadius: 50,
      paddingHorizontal: 10, paddingVertical: 4,
      marginBottom: 8,
    },
    brandBadgeText: {
      fontSize: 11, fontWeight: '700', color: theme.accent,
      textTransform: 'uppercase', letterSpacing: 0.5, fontStyle: 'italic',
    },
    name: { fontSize: 22, fontWeight: '700', color: theme.textPrimary, marginBottom: 10 },

    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
    price:    { fontSize: 24, fontWeight: '800', color: theme.accent },
    originalPrice: { fontSize: 16, color: theme.textSecondary, textDecorationLine: 'line-through' },
    saleBadge: {
      backgroundColor: '#EF4444', borderRadius: 50,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    saleBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

    stock:    { fontSize: 13, fontWeight: '600', marginBottom: 14 },
    inStock:  { color: '#38A169' },
    outStock: { color: '#E53E3E' },

    descSection: { marginBottom: 20 },
    descLabel: {
      fontSize: 13, fontWeight: '600', color: theme.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
    },
    descText:   { fontSize: 14, color: theme.textSecondary, lineHeight: 22 },
    descToggle: { color: theme.accent, fontSize: 13, fontWeight: '600', marginTop: 4 },

    selectorSection: { marginBottom: 20 },
    selectorLabel: {
      fontSize: 13, fontWeight: '600', color: theme.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
    },
    selectorHeaderRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    sizeGuideLink: {
      fontSize: 12, fontWeight: '600', color: theme.accent,
      textDecorationLine: 'underline', marginBottom: 10,
    },

    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    sizePill: {
      paddingHorizontal: 16, paddingVertical: 8,
      borderRadius: 50, borderWidth: 1.5, borderColor: theme.border,
      alignItems: 'center',
    },
    sizePillActive:     { backgroundColor: theme.accent, borderColor: theme.accent },
    sizePillOOS:        { opacity: 0.4 },
    sizePillText:       { fontSize: 14, color: theme.textPrimary, fontWeight: '500' },
    sizePillTextActive: { color: '#FFFFFF', fontWeight: '700' },
    sizePillTextOOS:    { textDecorationLine: 'line-through' },

    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    colorCircle: {
      width: 32, height: 32, borderRadius: 16,
      borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.08)',
    },
    colorCircleActive: {
      borderWidth: 3, borderColor: theme.accent,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4, shadowRadius: 4,
    },

    qtyPill: {
      flexDirection: 'row', alignItems: 'center', height: 44,
      alignSelf: 'flex-start',
      borderWidth: 1.5, borderColor: theme.border, borderRadius: 50, overflow: 'hidden',
    },
    qtyBtn:         { paddingHorizontal: 18, height: '100%', alignItems: 'center', justifyContent: 'center' },
    qtyBtnText:     { fontSize: 22, color: theme.accent, fontWeight: '700', lineHeight: 26 },
    qtyBtnDisabled: { opacity: 0.35 },
    qtyNum: {
      minWidth: 40, textAlign: 'center',
      fontSize: 16, fontWeight: '600', color: theme.textPrimary,
    },

    bottomBar: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 16, paddingVertical: 12,
      backgroundColor: theme.surface,
      borderTopWidth: 1, borderTopColor: theme.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06, shadowRadius: 10, elevation: 6,
    },
    wishlistBtn: {
      width: 52, height: 52, borderRadius: 26,
      borderWidth: 1.5, borderColor: theme.border,
      backgroundColor: theme.surface,
      alignItems: 'center', justifyContent: 'center',
    },
    wishlistBtnActive: { borderColor: '#FDE8E8' },
    addBtn: {
      flex: 1, backgroundColor: theme.accent,
      borderRadius: 50, height: 52,
      alignItems: 'center', justifyContent: 'center',
    },
    addBtnDisabled: { opacity: 0.45 },
    addBtnText:     { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  });
}
