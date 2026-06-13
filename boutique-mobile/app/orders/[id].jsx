import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOrder, useCancelOrder } from '../../src/hooks/api/useOrders';
import StatusBadge from '../../src/components/StatusBadge';
import LoadingScreen from '../../src/components/LoadingScreen';
import ErrorScreen from '../../src/components/ErrorScreen';
import { themes } from '../../src/theme/colors';
import { formatPrice } from '../../src/utils/formatPrice';

const theme = themes.default;
const TIMELINE = ['pending', 'processing', 'shipped', 'delivered'];
const FALLBACK = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop';

export default function OrderDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const cancelOrder = useCancelOrder();

  if (isLoading) return <LoadingScreen />;
  if (isError || !order) return <ErrorScreen onRetry={refetch} />;

  const currentStep = TIMELINE.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  const handleCancel = () => {
    Alert.alert(t('order.cancel'), t('order.cancel_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: () =>
          cancelOrder.mutate(id, {
            onError: (e) => Alert.alert('', e.response?.data?.message || t('common.error')),
          }),
      },
    ]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB');
  };

  const items = order.items ?? [];
  const SHIPPING = 15.0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>{'< '}{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('order.detail')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('order.number')}</Text>
            <Text style={styles.infoVal}>{order.order_number || order.number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('order.date')}</Text>
            <Text style={styles.infoVal}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <Text style={styles.infoLabel}>الحالة</Text>
            <StatusBadge status={order.status} />
          </View>
        </View>

        {/* Status Timeline */}
        {!isCancelled && (
          <View style={styles.timeline}>
            {TIMELINE.map((step, i) => {
              const done = i <= currentStep;
              return (
                <View key={step} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, done && styles.timelineDotDone]} />
                  {i < TIMELINE.length - 1 && (
                    <View style={[styles.timelineLine, i < currentStep && styles.timelineLineDone]} />
                  )}
                  <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>
                    {t(`order.status_${step}`)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Items */}
        <Text style={styles.sectionTitle}>{t('order.items')}</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image
              source={{ uri: item.product?.primary_image_url || FALLBACK }}
              style={styles.itemImg}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.product?.display_name || item.product?.name || ''}
              </Text>
              {item.size ? <Text style={styles.itemMeta}>{t('product.size')}: {item.size}</Text> : null}
              {item.color ? <Text style={styles.itemMeta}>{t('product.color')}: {item.color}</Text> : null}
              <Text style={styles.itemPrice}>
                {formatPrice(item.price, i18n.language)} × {item.quantity}
              </Text>
            </View>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>{t('cart.subtotal')}</Text>
            <Text style={styles.sumVal}>{formatPrice(order.subtotal ?? order.total, i18n.language)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>{t('checkout.shipping_fee')}</Text>
            <Text style={styles.sumVal}>{formatPrice(SHIPPING, i18n.language)}</Text>
          </View>
          <View style={[styles.sumRow, styles.sumTotal]}>
            <Text style={styles.sumTotalLabel}>{t('order.total')}</Text>
            <Text style={styles.sumTotalVal}>{formatPrice(order.total, i18n.language)}</Text>
          </View>
        </View>

        {/* Cancel button */}
        {order.status === 'pending' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>{t('order.cancel')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backText: { fontSize: 14, color: theme.accent, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.textPrimary },
  content: { padding: 16, paddingBottom: 40 },
  infoCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  infoLabel: { fontSize: 13, color: theme.textSecondary },
  infoVal: { fontSize: 13, fontWeight: '600', color: theme.textPrimary },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.border,
    borderWidth: 2,
    borderColor: theme.border,
  },
  timelineDotDone: { backgroundColor: theme.accent, borderColor: theme.accent },
  timelineLine: {
    position: 'absolute',
    top: 6,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: theme.border,
  },
  timelineLineDone: { backgroundColor: theme.accent },
  timelineLabel: { fontSize: 10, color: theme.textSecondary, marginTop: 6, textAlign: 'center' },
  timelineLabelDone: { color: theme.accent, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 10 },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  itemImg: { width: 72, height: 88 },
  itemInfo: { flex: 1, padding: 10 },
  itemName: { fontSize: 13, fontWeight: '600', color: theme.textPrimary, marginBottom: 3 },
  itemMeta: { fontSize: 11, color: theme.textSecondary },
  itemPrice: { fontSize: 13, fontWeight: '700', color: theme.accent, marginTop: 6 },
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
    marginTop: 4,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { fontSize: 13, color: theme.textSecondary },
  sumVal: { fontSize: 13, color: theme.textPrimary },
  sumTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 10,
    marginBottom: 0,
  },
  sumTotalLabel: { fontSize: 15, fontWeight: '700', color: theme.textPrimary },
  sumTotalVal: { fontSize: 15, fontWeight: '700', color: theme.accent },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#E53E3E',
    borderRadius: 50,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: '#E53E3E', fontSize: 14, fontWeight: '600' },
});
