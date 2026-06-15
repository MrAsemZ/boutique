import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../src/stores/authStore';
import { useUpdateProfile } from '../../src/hooks/api/useProfile';
import { changeLanguage } from '../../src/i18n/index';
import { themes } from '../../src/theme/colors';

const theme = themes.default;

const GENDER_OPTIONS = [
  { key: 'male',   ar: 'ذكر',                en: 'Male'               },
  { key: 'female', ar: 'أنثى',              en: 'Female'             },
  { key: '',       ar: 'أفضل عدم التحديد', en: 'Prefer not to say' },
];

const LANG_OPTIONS = [
  { key: 'ar', ar: 'العربية', en: 'AR' },
  { key: 'en', ar: 'EN',      en: 'English' },
];

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isArabic = i18n.language === 'ar';

  const updateProfile = useUpdateProfile();

  // Lazy initializer — no useEffect watching user
  const [form, setForm] = useState(() => ({
    name:             user?.name             || '',
    phone:            String(user?.phone     || ''),
    gender:           user?.gender           || '',
    preferred_locale: user?.preferred_locale || 'ar',
  }));

  const initials = form.name
    ? form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleLangChange = async (lang) => {
    setField('preferred_locale', lang);
    await changeLanguage(lang);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      Alert.alert('', isArabic ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    const payload = {
      name:             form.name.trim(),
      phone:            String(form.phone || ''),
      gender:           form.gender,
      preferred_locale: form.preferred_locale,
    };
    updateProfile.mutate(payload, {
      onSuccess: async (res) => {
        const updated = res?.data?.data?.user || res?.data?.data || user;
        setUser(updated);
        try {
          await AsyncStorage.setItem('auth_user', JSON.stringify(updated));
        } catch { /* ignore */ }
        Alert.alert('', isArabic ? 'تم الحفظ بنجاح' : 'Profile saved');
      },
      onError: (e) =>
        Alert.alert('', e.response?.data?.message || t('common.error')),
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('account.profile')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.avatarEmail}>{user?.email}</Text>
        </View>

        {/* Full Name */}
        <Text style={styles.label}>{isArabic ? 'الاسم الكامل' : 'Full Name'}</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(v) => setField('name', v)}
          placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
          placeholderTextColor="#9CA3AF"
        />

        {/* Email — read-only */}
        <Text style={styles.label}>{isArabic ? 'البريد الإلكتروني' : 'Email'}</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={user?.email || ''}
          editable={false}
          placeholderTextColor="#9CA3AF"
        />

        {/* Phone */}
        <Text style={styles.label}>{isArabic ? 'رقم الهاتف' : 'Phone'}</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(v) => setField('phone', v)}
          placeholder={isArabic ? 'أدخل رقم هاتفك' : 'Enter your phone'}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
        />

        {/* Gender */}
        <Text style={styles.label}>{isArabic ? 'الجنس' : 'Gender'}</Text>
        <View style={styles.pillGroup}>
          {GENDER_OPTIONS.map((g) => {
            const active = form.gender === g.key;
            return (
              <TouchableOpacity
                key={g.key + '_gender'}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setField('gender', g.key)}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {isArabic ? g.ar : g.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Language */}
        <Text style={styles.label}>{isArabic ? 'اللغة' : 'Language'}</Text>
        <View style={styles.pillGroup}>
          {LANG_OPTIONS.map((l) => {
            const active = form.preferred_locale === l.key;
            return (
              <TouchableOpacity
                key={l.key + '_lang'}
                style={[styles.pill, styles.pillLang, active && styles.pillActive]}
                onPress={() => handleLangChange(l.key)}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {isArabic ? l.ar : l.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, updateProfile.isPending && styles.btnDisabled]}
          onPress={handleSave}
          disabled={updateProfile.isPending}
          activeOpacity={0.85}
        >
          {updateProfile.isPending
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.saveBtnText}>
                {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
              </Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.textPrimary },

  scroll: { padding: 16 },

  avatarWrap: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText:  { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  avatarEmail: { fontSize: 13, color: theme.textSecondary },

  label: {
    fontSize: 13, fontWeight: '600', color: '#374151',
    marginBottom: 6, marginTop: 4,
  },
  input: {
    height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF', paddingHorizontal: 14,
    fontSize: 15, color: theme.textPrimary, marginBottom: 14,
  },
  inputDisabled: { backgroundColor: '#F9FAFB', color: '#9CA3AF' },

  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 50, borderWidth: 1.5, borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  pillLang: { minWidth: 80, alignItems: 'center' },
  pillActive:     { backgroundColor: theme.accent, borderColor: theme.accent },
  pillText:       { fontSize: 13, color: '#374151', fontWeight: '500' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },

  saveBtn: {
    height: 52, borderRadius: 50, backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  btnDisabled:  { opacity: 0.6 },
  saveBtnText:  { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
