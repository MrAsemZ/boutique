import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import useCartStore from '../../src/stores/cartStore';
import { themes } from '../../src/theme/colors';

const theme = themes.default;

export default function OrderSuccessScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { orderNumber } = useLocalSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Checkmark */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>

        <Text style={styles.title}>{t('order.success_title')}</Text>
        <Text style={styles.subtitle}>{t('order.success_subtitle')}</Text>

        {orderNumber ? (
          <View style={styles.orderNumWrap}>
            <Text style={styles.orderNumLabel}>{t('order.number')}</Text>
            <Text style={styles.orderNum}>{orderNumber}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => router.replace('/orders')}
        >
          <Text style={styles.trackBtnText}>{t('order.track')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.continueBtnText}>{t('order.continue')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#38A169',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  checkMark: { fontSize: 48, color: '#FFF', fontWeight: '700' },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  orderNumWrap: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.border,
    width: '100%',
  },
  orderNumLabel: { fontSize: 12, color: theme.textSecondary, marginBottom: 4 },
  orderNum: { fontSize: 18, fontWeight: '700', color: theme.accent },
  trackBtn: {
    backgroundColor: theme.accent,
    borderRadius: 50,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  trackBtnText: { color: theme.surface, fontSize: 16, fontWeight: '700' },
  continueBtn: {
    borderWidth: 1.5,
    borderColor: theme.accent,
    borderRadius: 50,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: { color: theme.accent, fontSize: 16, fontWeight: '600' },
});
