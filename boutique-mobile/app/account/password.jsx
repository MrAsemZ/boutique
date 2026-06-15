import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useUpdatePassword } from '../../src/hooks/api/useProfile';
import { themes } from '../../src/theme/colors';

const theme = themes.default;

function PasswordField({ label, value, onChangeText, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.inputField}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setShow((v) => !v)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={show ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PasswordScreen() {
  const { t, i18n } = useTranslation();
  const router   = useRouter();
  const isArabic = i18n.language === 'ar';

  const updatePassword = useUpdatePassword();

  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');

  const handleSave = () => {
    if (!current || !next || !confirm) {
      Alert.alert('', isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }
    if (next !== confirm) {
      Alert.alert(
        '',
        isArabic ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match'
      );
      return;
    }
    if (next.length < 8) {
      Alert.alert(
        '',
        isArabic ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters'
      );
      return;
    }
    updatePassword.mutate(
      { current_password: current, password: next, password_confirmation: confirm },
      {
        onSuccess: () => {
          setCurrent('');
          setNext('');
          setConfirm('');
          Alert.alert(
            '',
            isArabic ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'
          );
        },
        onError: (e) =>
          Alert.alert('', e.response?.data?.message || t('common.error')),
      }
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('account.password')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={32} color={theme.accent} />
          </View>
          <Text style={styles.iconHint}>
            {isArabic
              ? 'اختر كلمة مرور قوية لحماية حسابك'
              : 'Choose a strong password to secure your account'}
          </Text>
        </View>

        <View style={styles.card}>
          <PasswordField
            label={isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
            value={current}
            onChangeText={setCurrent}
            placeholder={isArabic ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
          />
          <PasswordField
            label={isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
            value={next}
            onChangeText={setNext}
            placeholder={isArabic ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
          />
          <PasswordField
            label={isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
            value={confirm}
            onChangeText={setConfirm}
            placeholder={isArabic ? 'أعد إدخال كلمة المرور' : 'Re-enter new password'}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, updatePassword.isPending && styles.btnDisabled]}
          onPress={handleSave}
          disabled={updatePassword.isPending}
          activeOpacity={0.85}
        >
          {updatePassword.isPending
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.saveBtnText}>
                {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
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
  backBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.textPrimary },

  scroll: { padding: 16 },

  iconWrap: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  iconHint: {
    fontSize: 13, color: theme.textSecondary,
    textAlign: 'center', lineHeight: 20, paddingHorizontal: 16,
  },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#F0EDE8', marginBottom: 20,
  },

  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, gap: 8,
  },
  inputField: { flex: 1, fontSize: 15, color: theme.textPrimary },

  saveBtn: {
    height: 52, borderRadius: 50, backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
