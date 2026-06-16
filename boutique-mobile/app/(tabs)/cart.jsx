import {
  View, Text, FlatList, TouchableOpacity, Image,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useCart, useRemoveFromCart, useUpdateCartItem, useApplyVoucher } from '../../src/hooks/api/useCart';
import useAuthStore from '../../src/stores/authStore';
import useCartStore from '../../src/stores/cartStore';
import EmptyState from '../../src/components/EmptyState';
import LoadingScreen from '../../src/components/LoadingScreen';
import { useAppTheme } from '../../src/context/ThemeContext';
import { formatPrice } from '../../src/utils/formatPrice';

const SHIPPING = 15.0;

export default function CartScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isArabic = i18n.language === 'ar';
  const theme  = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [voucher, setVoucher] = useState('');

  const cartQuery = useCart();
  const removeItem = useRemoveFromCart();
  const updateItem = useUpdateCartItem();
  const applyVoucher = useApplyVoucher();

  const guestItems = useCartStore((s) => s.items);
  const guestSubtotal = useCartStore((s) => s.subtotal);
  const guestStore = useCartStore.getState();

  const items = isAuthenticated ? (cartQuery.data?.items ?? []) : guestItems;
  const subtotal = isAuthenticated ? (cartQuery.data?.subtotal ?? 0) : guestSubtotal;
  const discount = cartQuery.data?.discount ?? 0;

  if (isAuthenticated && cartQuery.isLoading) return <LoadingScreen />;

  const handleRemove = (item) => {
    if (isAuthenticated) {
      removeItem.mutate(item.id);
    } else {
      const next = guestItems.filter((i) => i.id !== item.id);
      guestStore.setCart({
        items: next,
        item_count: next.reduce((s, i) => s + i.quantity, 0),
        subtotal: next.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0),
      });
      guestStore.saveGuestCart();
    }
  };

  const handleQty = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (isAuthenticated) {
      updateItem.mutate({ itemId: item.id, quantity: newQty });
    } else {
      const next = guestItems.map((i) =>
        i.id === item.id ? { ...i, quantity: newQty } : i
      );
      guestStore.setCart({
        items: next,
        item_count: next.reduce((s, i) => s + i.quantity, 0),
        subtotal: next.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0),
      });
      guestStore.saveGuestCart();
    }
  };

  const handleApplyVoucher = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!voucher.trim()) return;
    applyVoucher.mutate(voucher, {
      onError: (e) => Alert.alert('', e.response?.data?.message || t('common.error')),
    });
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    Alert.alert(
      isArabic ? 'إفراغ السلة' : 'Clear Cart',
      isArabic ? 'هل تريد حذف كل العناصر من السلة؟' : 'Remove all items from your cart?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: isArabic ? 'إفراغ' : 'Clear',
          style: 'destructive',
          onPress: () => {
            if (isAuthenticated) {
              items.forEach((item) => removeItem.mutate(item.id));
            } else {
              guestStore.clearGuestCart();
            }
          },
        },
      ]
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.pageTitle}>{t('cart.title')}</Text>
        <EmptyState
          icon="🛒"
          title={t('cart.empty')}
          actionLabel={t('home.shop_now')}
          onAction={() => router.push('/(tabs)/shop')}
        />
      </SafeAreaView>
    );
  }

  const total = parseFloat(subtotal) - parseFloat(discount) + SHIPPING;

  const renderItem = ({ item }) => {
    const name  = item.product?.display_name || item.product?.name || item.name || '';
    const brand = item.product?.brand || '';
    const image = item.product?.primary_image_url || item.image;
    const price = item.price || item.product?.sale_price || item.product?.base_price || 0;
    return (
      <View style={styles.item}>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color="#E53E3E" />
        </TouchableOpacity>

        <Image source={{ uri: image }} style={styles.itemImg} resizeMode="cover" />

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
          {brand ? <Text style={styles.itemBrand}>{brand}</Text> : null}

          {(item.size || item.color) && (
            <View style={styles.metaPillRow}>
              {item.size ? (
                <View style={styles.metaPill}><Text style={styles.metaPillText}>{item.size}</Text></View>
              ) : null}
              {item.color ? (
                <View style={styles.metaPill}><Text style={styles.metaPillText}>{item.color}</Text></View>
              ) : null}
            </View>
          )}

          <View style={styles.itemBottomRow}>
            <Text style={styles.itemPrice}>{formatPrice(price, i18n.language)}</Text>
            <View style={styles.qtyPill}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQty(item, -1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQty(item, 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.pageTitle}>{t('cart.title')}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{items.length}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>{isArabic ? 'إفراغ السلة' : 'Clear Cart'}</Text>
        </TouchableOpacity>
      </View>

      {/* Guest banner */}
      {!isAuthenticated && (
        <View style={styles.guestBanner}>
          <Ionicons name="information-circle-outline" size={18} color={theme.accent} />
          <Text style={styles.guestBannerText}>
            {isArabic ? 'سجل دخولك لحفظ سلتك' : 'Sign in to save your cart'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.guestBannerLink}>
              {isArabic ? 'تسجيل الدخول' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View>
            {/* Order summary */}
            <View style={styles.summary}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{t('cart.subtotal')}</Text>
                <Text style={styles.rowVal}>{formatPrice(subtotal, i18n.language)}</Text>
              </View>
              {parseFloat(discount) > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.rowLabel, { color: '#38A169' }]}>
                    {isArabic ? 'خصم' : 'Discount'}
                  </Text>
                  <Text style={[styles.rowVal, { color: '#38A169' }]}>
                    -{formatPrice(discount, i18n.language)}
                  </Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{t('cart.shipping')}</Text>
                <Text style={styles.rowVal}>{formatPrice(SHIPPING, i18n.language)}</Text>
              </View>
              <View style={[styles.row, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('cart.total')}</Text>
                <Text style={styles.totalVal}>{formatPrice(total, i18n.language)}</Text>
              </View>

              {/* Voucher */}
              <View style={styles.voucherRow}>
                <TextInput
                  style={styles.voucherInput}
                  placeholder={t('cart.voucher')}
                  placeholderTextColor={theme.textSecondary}
                  value={voucher}
                  onChangeText={setVoucher}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={handleApplyVoucher}>
                  <Text style={styles.applyBtnText}>{t('cart.apply')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Checkout */}
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() =>
                isAuthenticated ? router.push('/checkout') : router.push('/auth/login')
              }
            >
              <Text style={styles.checkoutBtnText}>
                {t('cart.checkout')} — {formatPrice(total, i18n.language)}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bg },

    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 12,
    },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pageTitle: { fontSize: 20, fontWeight: '700', color: theme.textPrimary },
    countBadge: {
      backgroundColor: theme.accent, borderRadius: 10,
      minWidth: 20, height: 20, paddingHorizontal: 5,
      alignItems: 'center', justifyContent: 'center',
    },
    countBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    clearText: { fontSize: 13, color: theme.textSecondary, fontWeight: '600' },

    guestBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: theme.bg,
      borderWidth: 1, borderColor: theme.border,
      marginHorizontal: 16, marginBottom: 10,
      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    },
    guestBannerText: { flex: 1, fontSize: 12, color: theme.textSecondary },
    guestBannerLink: { fontSize: 12, fontWeight: '700', color: theme.accent },

    list: { paddingHorizontal: 16, paddingBottom: 24 },

    item: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: 14,
      marginBottom: 10,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06, shadowRadius: 8,
      elevation: 2,
    },
    removeBtn: {
      position: 'absolute', top: 8, right: 8, zIndex: 2,
      width: 26, height: 26, borderRadius: 13,
      backgroundColor: '#FEF2F2',
      alignItems: 'center', justifyContent: 'center',
    },
    itemImg: { width: 90, height: 90, borderRadius: 10 },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName:  { fontSize: 14, fontWeight: '700', color: theme.textPrimary, paddingRight: 30 },
    itemBrand: { fontSize: 11, color: theme.textSecondary, fontStyle: 'italic', marginTop: 2 },

    metaPillRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
    metaPill: {
      backgroundColor: theme.bg, borderRadius: 50,
      paddingHorizontal: 8, paddingVertical: 2,
    },
    metaPillText: { fontSize: 10, color: theme.textSecondary, fontWeight: '600' },

    itemBottomRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginTop: 10,
    },
    itemPrice: { fontSize: 16, fontWeight: '800', color: theme.accent },

    qtyPill: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1, borderColor: theme.border, borderRadius: 50,
      overflow: 'hidden',
    },
    qtyBtn: {
      width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
    },
    qtyBtnText: { fontSize: 16, color: theme.textPrimary, lineHeight: 20 },
    qtyNum: {
      fontSize: 13, fontWeight: '700', color: theme.textPrimary,
      minWidth: 22, textAlign: 'center',
    },

    summary: {
      backgroundColor: theme.accent + '0D',
      borderRadius: 16,
      padding: 16,
      marginTop: 4,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    rowLabel: { fontSize: 14, color: theme.textSecondary },
    rowVal:   { fontSize: 14, color: theme.textPrimary },
    totalRow: {
      borderTopWidth: 1, borderTopColor: theme.border,
      paddingTop: 12, marginTop: 4, marginBottom: 14,
    },
    totalLabel: { fontSize: 17, fontWeight: '800', color: theme.textPrimary },
    totalVal:   { fontSize: 17, fontWeight: '800', color: theme.accent },

    voucherRow: { flexDirection: 'row', gap: 8 },
    voucherInput: {
      flex: 1, backgroundColor: theme.surface, borderRadius: 8,
      borderWidth: 1, borderColor: theme.border,
      paddingHorizontal: 12, height: 44,
      fontSize: 13, color: theme.textPrimary,
    },
    applyBtn: {
      backgroundColor: theme.accent, borderRadius: 8,
      paddingHorizontal: 16, height: 44, justifyContent: 'center',
    },
    applyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

    checkoutBtn: {
      backgroundColor: theme.accent,
      borderRadius: 50,
      height: 56,
      alignItems: 'center', justifyContent: 'center',
      marginTop: 16,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 10,
      elevation: 6,
    },
    checkoutBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
}
