import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useOrders } from '../../src/hooks/api/useOrders';
import useAuthStore from '../../src/stores/authStore';
import StatusBadge from '../../src/components/StatusBadge';
import LoadingScreen from '../../src/components/LoadingScreen';
import EmptyState from '../../src/components/EmptyState';
import { themes } from '../../src/theme/colors';
import { formatPrice } from '../../src/utils/formatPrice';

const theme = themes.default;

export default function OrdersScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);

  const { data, isLoading, refetch, isRefetching } = useOrders();
  const orders = Array.isArray(data?.data) ? data.data : [];

  if (!isAuthenticated) return null;
  if (isLoading) return <LoadingScreen />;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(
      i18n.language === 'ar' ? 'ar-JO' : 'en-GB'
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/orders/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNum}>{item.order_number || item.number}</Text>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.orderMeta}>
        <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        <Text style={styles.orderItems}>
          {item.items_count ?? (item.items?.length ?? 0)} {t('order.items')}
        </Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>{formatPrice(item.total, i18n.language)}</Text>
        <Text style={styles.viewDetails}>{'← '}{t('order.detail')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>{'< '}{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('order.history')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />
        }
        ListEmptyComponent={
          <EmptyState icon="📦" title={t('order.empty')} />
        }
      />
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
  list: { padding: 16, paddingBottom: 32 },
  orderCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNum: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  orderMeta: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  orderDate: { fontSize: 12, color: theme.textSecondary },
  orderItems: { fontSize: 12, color: theme.textSecondary },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 16, fontWeight: '700', color: theme.accent },
  viewDetails: { fontSize: 13, color: theme.accent, fontWeight: '600' },
});
