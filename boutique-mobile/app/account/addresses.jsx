import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Alert, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from '../../src/hooks/api/useAddresses';
import LoadingScreen from '../../src/components/LoadingScreen';
import { themes } from '../../src/theme/colors';

const theme = themes.default;

const LABEL_OPTIONS = [
  { key: 'home', ar: 'المنزل', en: 'Home' },
  { key: 'work', ar: 'العمل',  en: 'Work'  },
  { key: 'other', ar: 'أخرى',  en: 'Other' },
];

const EMPTY_FORM = {
  label: 'home', full_name: '', phone: '',
  address_line1: '', address_line2: '', city: '', country: 'Jordan',
};

export default function AddressesScreen() {
  const { t, i18n } = useTranslation();
  const router  = useRouter();
  const isArabic = i18n.language === 'ar';

  const { data: addresses = [], isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing]           = useState(null); // null = new
  const [form, setForm]                 = useState(EMPTY_FORM);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (addr) => {
    setEditing(addr.id);
    setForm({
      label:         addr.label         || 'home',
      full_name:     addr.full_name     || '',
      phone:         addr.phone         || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city:          addr.city          || '',
      country:       addr.country       || 'Jordan',
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.full_name.trim() || !form.phone.trim() || !form.address_line1.trim() || !form.city.trim()) {
      Alert.alert('', isArabic ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }
    const mutation = editing ? updateAddress : createAddress;
    const payload  = editing ? { id: editing, ...form } : form;
    mutation.mutate(payload, {
      onSuccess: () => {
        setModalVisible(false);
        setForm(EMPTY_FORM);
        setEditing(null);
      },
      onError: (e) =>
        Alert.alert('', e.response?.data?.message || t('common.error')),
    });
  };

  const handleDelete = (id) => {
    Alert.alert(
      isArabic ? 'حذف العنوان' : 'Delete Address',
      isArabic ? 'هل تريد حذف هذا العنوان؟' : 'Delete this address?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: isArabic ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteAddress.mutate(id, {
              onError: (e) =>
                Alert.alert('', e.response?.data?.message || t('common.error')),
            }),
        },
      ]
    );
  };

  const isSaving = createAddress.isPending || updateAddress.isPending;

  const renderAddress = ({ item }) => {
    const labelOpt = LABEL_OPTIONS.find((l) => l.key === item.label);
    const labelText = labelOpt ? (isArabic ? labelOpt.ar : labelOpt.en) : item.label;
    return (
      <View style={styles.addrCard}>
        <View style={styles.addrTop}>
          <View style={styles.labelBadge}>
            <Text style={styles.labelBadgeText}>{labelText}</Text>
          </View>
          {item.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>
                {isArabic ? 'افتراضي' : 'Default'}
              </Text>
            </View>
          )}
          <View style={styles.addrActions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
              <Ionicons name="pencil-outline" size={17} color={theme.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={17} color="#E53E3E" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.addrName}>{item.full_name}</Text>
        <Text style={styles.addrLine}>{item.phone}</Text>
        <Text style={styles.addrLine}>{item.address_line1}{item.address_line2 ? `, ${item.address_line2}` : ''}</Text>
        <Text style={styles.addrLine}>{item.city}{item.country ? `, ${item.country}` : ''}</Text>
      </View>
    );
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('account.addresses')}</Text>
        <TouchableOpacity style={styles.addHeaderBtn} onPress={openNew}>
          <Ionicons name="add" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="location-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {isArabic ? 'لا توجد عناوين بعد' : 'No addresses yet'}
            </Text>
            <TouchableOpacity style={styles.addBtn} onPress={openNew}>
              <Text style={styles.addBtnText}>
                {isArabic ? 'إضافة عنوان' : 'Add Address'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          addresses.length > 0
            ? (
              <TouchableOpacity style={styles.addBtn} onPress={openNew}>
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.addBtnText}>
                  {isArabic ? 'إضافة عنوان جديد' : 'Add New Address'}
                </Text>
              </TouchableOpacity>
            )
            : null
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editing
                  ? (isArabic ? 'تعديل العنوان' : 'Edit Address')
                  : (isArabic ? 'عنوان جديد'   : 'New Address')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
              {/* Label pills */}
              <Text style={styles.fieldLabel}>{isArabic ? 'التصنيف' : 'Label'}</Text>
              <View style={styles.pillRow}>
                {LABEL_OPTIONS.map((l) => {
                  const active = form.label === l.key;
                  return (
                    <TouchableOpacity
                      key={l.key}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setField('label', l.key)}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {isArabic ? l.ar : l.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Fields */}
              {[
                { key: 'full_name',     ar: 'الاسم الكامل *',           en: 'Full Name *'           },
                { key: 'phone',         ar: 'رقم الهاتف *',             en: 'Phone *'               },
                { key: 'address_line1', ar: 'العنوان التفصيلي *',        en: 'Address Line 1 *'      },
                { key: 'address_line2', ar: 'العنوان التفصيلي 2 (اختياري)', en: 'Address Line 2 (optional)' },
                { key: 'city',          ar: 'المدينة *',                 en: 'City *'                },
                { key: 'country',       ar: 'الدولة',                   en: 'Country'               },
              ].map(({ key, ar, en }) => (
                <View key={key}>
                  <Text style={styles.fieldLabel}>{isArabic ? ar : en}</Text>
                  <TextInput
                    style={styles.input}
                    value={form[key]}
                    onChangeText={(v) => setField(key, v)}
                    placeholderTextColor="#9CA3AF"
                    placeholder={isArabic ? ar.replace(' *', '') : en.replace(' *', '').replace(' (optional)', '')}
                    keyboardType={key === 'phone' ? 'phone-pad' : 'default'}
                  />
                </View>
              ))}

              <View style={{ height: 8 }} />
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.btnDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.saveBtnText}>{isArabic ? 'حفظ' : 'Save'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7F4' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0EDE8',
  },
  backBtn:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addHeaderBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 17, fontWeight: '700', color: theme.textPrimary },

  list: { padding: 16, paddingBottom: 32 },

  addrCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#F0EDE8',
  },
  addrTop:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  labelBadge: {
    backgroundColor: '#F3F4F6', borderRadius: 50,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  labelBadgeText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  defaultBadge: {
    backgroundColor: '#D1FAE5', borderRadius: 50,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  defaultBadgeText: { fontSize: 11, fontWeight: '600', color: '#065F46' },
  addrActions:  { flexDirection: 'row', gap: 4, marginLeft: 'auto' },
  actionBtn:    { padding: 6 },
  addrName:     { fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 2 },
  addrLine:     { fontSize: 13, color: theme.textSecondary, marginBottom: 1 },

  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyText: { fontSize: 15, color: theme.textSecondary, textAlign: 'center' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: theme.accent, borderRadius: 50,
    height: 52, marginTop: 16, marginHorizontal: 16,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Modal
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16,
    height: '82%',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB',
    alignSelf: 'center', marginTop: 10, marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  sheetTitle:   { fontSize: 16, fontWeight: '700', color: theme.textPrimary },
  sheetContent: { padding: 20, paddingBottom: 8 },
  sheetFooter:  { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },

  fieldLabel: {
    fontSize: 12, fontWeight: '600', color: '#374151',
    marginBottom: 6, marginTop: 8,
  },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 50, borderWidth: 1.5, borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  pillActive:     { backgroundColor: theme.accent, borderColor: theme.accent },
  pillText:       { fontSize: 13, color: '#374151', fontWeight: '500' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },

  input: {
    height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF', paddingHorizontal: 14,
    fontSize: 14, color: theme.textPrimary, marginBottom: 2,
  },

  saveBtn: {
    height: 52, borderRadius: 50, backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
