import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import api from '../../src/api/axios';
import { useAddresses, useCreateAddress } from '../../src/hooks/api/useAddresses';
import useCartStore from '../../src/stores/cartStore';
import { themes } from '../../src/theme/colors';
import { formatPrice } from '../../src/utils/formatPrice';

const theme = themes.default;
const SHIPPING = 15.0;
const STEPS = ['checkout.address_step', 'checkout.payment_step', 'checkout.confirm_step'];

function StepIndicator({ current }) {
  return (
    <View style={styles.stepRow}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.stepItem}>
          <View style={[styles.stepCircle, i <= current && styles.stepCircleActive]}>
            <Text style={[styles.stepNum, i <= current && styles.stepNumActive]}>{i + 1}</Text>
          </View>
          {i < 2 && <View style={[styles.stepLine, i < current && styles.stepLineActive]} />}
        </View>
      ))}
    </View>
  );
}

export default function CheckoutScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);

  // Address form state
  const [form, setForm] = useState({ full_name: '', phone: '', address_line1: '', city: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: addresses = [] } = useAddresses();
  const createAddress = useCreateAddress();
  const subtotal = useCartStore((s) => s.subtotal);
  const items = useCartStore((s) => s.items);
  const total = parseFloat(subtotal) + SHIPPING;

  const handleSaveAddress = () => {
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city) {
      Alert.alert('', t('common.error'));
      return;
    }
    createAddress.mutate(form, {
      onSuccess: (data) => {
        setSelectedAddressId(data?.data?.data?.id);
        setShowAddForm(false);
      },
    });
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('', t('checkout.select_address'));
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/checkout', {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
      });
      const orderNumber = data?.data?.order_number || data?.data?.number || '';
      router.replace({ pathname: '/checkout/success', params: { orderNumber } });
    } catch (e) {
      Alert.alert('', e.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step > 0 ? setStep((s) => s - 1) : router.back())}>
          <Text style={styles.backText}>{'< '}{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <StepIndicator current={step} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ── Step 0: Address ── */}
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>{t('checkout.address_step')}</Text>

            {addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                style={[styles.addrCard, selectedAddressId === addr.id && styles.addrCardActive]}
                onPress={() => setSelectedAddressId(addr.id)}
              >
                <View style={styles.addrRadio}>
                  {selectedAddressId === addr.id && <View style={styles.addrRadioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addrName}>{addr.full_name}</Text>
                  <Text style={styles.addrLine}>{addr.address_line1}, {addr.city}</Text>
                  <Text style={styles.addrLine}>{addr.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Add address form */}
            <TouchableOpacity
              style={styles.addAddrBtn}
              onPress={() => setShowAddForm((v) => !v)}
            >
              <Text style={styles.addAddrText}>+ {t('checkout.add_address')}</Text>
            </TouchableOpacity>

            {showAddForm && (
              <View style={styles.addrForm}>
                {['full_name', 'phone', 'address_line1', 'city'].map((field) => (
                  <TextInput
                    key={field}
                    style={styles.input}
                    placeholder={t(`checkout.${field}`)}
                    placeholderTextColor={theme.textSecondary}
                    value={form[field]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                  />
                ))}
                <TouchableOpacity style={styles.saveAddrBtn} onPress={handleSaveAddress}>
                  <Text style={styles.saveAddrBtnText}>{t('checkout.save_address')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── Step 1: Payment ── */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>{t('checkout.payment_step')}</Text>
            {[
              { key: 'cod', title: t('checkout.cod'), desc: t('checkout.cod_desc'), icon: '💵' },
              { key: 'cliq', title: t('checkout.cliq'), desc: t('checkout.cliq_desc'), icon: '📱' },
            ].map((method) => (
              <TouchableOpacity
                key={method.key}
                style={[styles.payCard, paymentMethod === method.key && styles.payCardActive]}
                onPress={() => setPaymentMethod(method.key)}
              >
                <Text style={styles.payIcon}>{method.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>{method.title}</Text>
                  <Text style={styles.payDesc}>{method.desc}</Text>
                </View>
                <View style={styles.payRadio}>
                  {paymentMethod === method.key && <View style={styles.payRadioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Step 2: Confirm ── */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>{t('checkout.order_summary')}</Text>
            <View style={styles.summaryCard}>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>{t('cart.subtotal')}</Text>
                <Text style={styles.sumVal}>{formatPrice(subtotal, i18n.language)}</Text>
              </View>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>{t('checkout.shipping_fee')}</Text>
                <Text style={styles.sumVal}>{formatPrice(SHIPPING, i18n.language)}</Text>
              </View>
              <View style={[styles.sumRow, styles.sumTotal]}>
                <Text style={styles.sumTotalLabel}>{t('cart.total')}</Text>
                <Text style={styles.sumTotalVal}>{formatPrice(total, i18n.language)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer button */}
      <View style={styles.footer}>
        {step < 2 ? (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => setStep((s) => s + 1)}
          >
            <Text style={styles.nextBtnText}>{t('checkout.next')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, submitting && styles.btnDisabled]}
            onPress={handleConfirmOrder}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={theme.surface} />
            ) : (
              <Text style={styles.nextBtnText}>{t('checkout.confirm')}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: theme.surface,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg,
  },
  stepCircleActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  stepNum: { fontSize: 13, fontWeight: '700', color: theme.textSecondary },
  stepNumActive: { color: theme.surface },
  stepLine: { width: 40, height: 2, backgroundColor: theme.border, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: theme.accent },
  content: { padding: 16, paddingBottom: 32 },
  stepTitle: { fontSize: 18, fontWeight: '700', color: theme.textPrimary, marginBottom: 16 },
  addrCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
  },
  addrCardActive: { borderColor: theme.accent },
  addrRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent },
  addrName: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
  addrLine: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  addAddrBtn: {
    borderWidth: 1.5,
    borderColor: theme.accent,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  addAddrText: { color: theme.accent, fontSize: 14, fontWeight: '600' },
  addrForm: { gap: 10, marginTop: 4 },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    color: theme.textPrimary,
  },
  saveAddrBtn: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAddrBtnText: { color: theme.surface, fontSize: 14, fontWeight: '600' },
  payCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  payCardActive: { borderColor: theme.accent },
  payIcon: { fontSize: 28 },
  payTitle: { fontSize: 15, fontWeight: '600', color: theme.textPrimary },
  payDesc: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  payRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.accent },
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sumLabel: { fontSize: 14, color: theme.textSecondary },
  sumVal: { fontSize: 14, color: theme.textPrimary },
  sumTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
    marginBottom: 0,
  },
  sumTotalLabel: { fontSize: 16, fontWeight: '700', color: theme.textPrimary },
  sumTotalVal: { fontSize: 16, fontWeight: '700', color: theme.accent },
  footer: {
    padding: 16,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  nextBtn: {
    backgroundColor: theme.accent,
    borderRadius: 50,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  nextBtnText: { color: theme.surface, fontSize: 16, fontWeight: '700' },
});
