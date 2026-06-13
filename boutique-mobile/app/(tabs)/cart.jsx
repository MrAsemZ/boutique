import {
  View, Text, FlatList, TouchableOpacity, Image,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useCart, useRemoveFromCart, useUpdateCartItem, useApplyVoucher } from '../../src/hooks/api/useCart';
import useAuthStore from '../../src/stores/authStore';
import useCartStore from '../../src/stores/cartStore';
import EmptyState from '../../src/components/EmptyState';
import LoadingScreen from '../../src/components/LoadingScreen';
import { themes } from '../../src/theme/colors';
import { formatPrice } from '../../src/utils/formatPrice';

const theme = themes.default;
const SHIPPING = 15.0;

export default function CartScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
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
    applyVoucher.mutate(voucher, {
      onError: (e) => Alert.alert('', e.response?.data?.message || t('common.error')),
    });
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
    const name = item.product?.display_name || item.product?.name || item.name || '';
    const image = item.product?.primary_image_url || item.image;
    const price = item.price || item.product?.sale_price || item.product?.base_price || 0;
    return (
      <View style={styles.item}>
        <Image source={{ uri: image }} style={styles.itemImg} resizeMode="cover" />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
          {item.size ? <Text style={styles.itemMeta}>{t('product.size')}: {item.size}</Text> : null}
          {item.color ? <Text style={styles.itemMeta}>{t('product.color')}: {item.color}</Text> : null}
          <Text style={styles.itemPrice}>{formatPrice(price, i18n.language)}</Text>
          <View style={styles.itemActions}>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQty(item, -1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQty(item, 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={20} color="#E53E3E" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.pageTitle}>{t('cart.title')}</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={styles.summary}>
            {/* Voucher */}
            <View style={styles.voucherRow}>
              <TextInput
                style={styles.voucherInput}
                placeholder={t('cart.voucher')}
                placeholderTextColor={theme.textSecondary}
                value={voucher}
                onChangeText={setVoucher}
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyVoucher}>
                <Text style={styles.applyBtnText}>{t('cart.apply')}</Text>
              </TouchableOpacity>
            </View>
            {/* Totals */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('cart.subtotal')}</Text>
              <Text style={styles.rowVal}>{formatPrice(subtotal, i18n.language)}</Text>
            </View>
            {parseFloat(discount) > 0 && (
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: '#38A169' }]}>خصم</Text>
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
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() =>
                isAuthenticated ? router.push('/checkout') : router.push('/auth/login')
              }
            >
              <Text style={styles.checkoutBtnText}>{t('cart.checkout')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  item: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  itemImg: { width: 84, height: 100 },
  itemInfo: { flex: 1, padding: 10 },
  itemName: { fontSize: 13, fontWeight: '600', color: theme.textPrimary, marginBottom: 3 },
  itemMeta: { fontSize: 11, color: theme.textSecondary },
  itemPrice: { fontSize: 14, fontWeight: '700', color: theme.accent, marginVertical: 6 },
  itemActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.bg,
  },
  qtyBtnText: { fontSize: 16, color: theme.textPrimary, lineHeight: 20 },
  qtyNum: {
    fontSize: 14, fontWeight: '600', color: theme.textPrimary,
    minWidth: 20, textAlign: 'center',
  },
  summary: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  voucherRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  voucherInput: {
    flex: 1,
    backgroundColor: theme.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: theme.textPrimary,
  },
  applyBtn: {
    backgroundColor: theme.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
  },
  applyBtnText: { color: theme.surface, fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: 14, color: theme.textSecondary },
  rowVal: { fontSize: 14, color: theme.textPrimary },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: theme.textPrimary },
  totalVal: { fontSize: 16, fontWeight: '700', color: theme.accent },
  checkoutBtn: {
    backgroundColor: theme.accent,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutBtnText: { color: theme.surface, fontSize: 16, fontWeight: '700' },
});
