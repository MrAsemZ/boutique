import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRegister } from '../../src/hooks/api/useAuth';

// ── Design tokens ────────────────────────────────────────────────────────────
const BG        = '#F5F3EF';
const BLACK     = '#1A1A1A';
const BORDER    = '#D1D5DB';
const GRAY      = '#888888';
const DARK_GRAY = '#374151';

// ── Password input with eye toggle ───────────────────────────────────────────
function PasswordInput({ value, onChangeText, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.inputWrap}>
      <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!show}
      />
      <TouchableOpacity
        onPress={() => setShow((v) => !v)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const registerMutation = useRegister();
  const isArabic = i18n.language === 'ar';

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender,          setGender]          = useState('male');
  const [agreed,          setAgreed]          = useState(false);

  // ── Logic — unchanged ──────────────────────────────────────────────────────
  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('', isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('', isArabic ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    if (!agreed) {
      Alert.alert('', isArabic ? 'يرجى الموافقة على الشروط والأحكام' : 'Please agree to the Terms & Conditions');
      return;
    }
    registerMutation.mutate(
      { name: name.trim(), email: email.trim(), password, password_confirmation: confirmPassword, gender },
      {
        onSuccess: () => router.replace('/'),
        onError:  (e) => Alert.alert('', e.response?.data?.message || 'حدث خطأ / Something went wrong'),
      }
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Decorative brand header ── */}
          <View style={styles.brandPanel}>
            <Text style={styles.brandTitle}>
              {isArabic ? 'أناقتك تبدأ هنا' : 'Your elegance starts here'}
            </Text>
            <View style={styles.brandAccent} />
            <Text style={styles.brandSubtitle}>
              {isArabic
                ? 'اكتشف أزياءً تعبّر عن أسلوبك'
                : 'Discover fashion that speaks your style'}
            </Text>
          </View>

          <View style={styles.card}>

            {/* ── Brand ── */}
            <Text style={styles.brand}>Boutique</Text>

            {/* ── Heading ── */}
            <Text style={styles.title}>
              {isArabic ? 'إنشاء حساب' : 'Create your account'}
            </Text>
            <Text style={styles.subtitle}>
              {isArabic ? 'انضم إلينا اليوم' : 'Join our community today'}
            </Text>

            {/* ── Full Name ── */}
            <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic ? 'الاسم الكامل' : 'Full Name'}
            </Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>

            {/* ── Email ── */}
            <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
            </Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* ── Password ── */}
            <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic ? 'كلمة المرور' : 'Password'}
            </Text>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder={isArabic ? 'أنشئ كلمة مرور' : 'Create a password'}
            />

            {/* ── Confirm Password ── */}
            <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </Text>
            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={isArabic ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
            />

            {/* ── Gender ── */}
            <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic ? 'الجنس' : 'Gender'}
            </Text>
            <View style={styles.genderRow}>
              {[
                { key: 'male',   ar: 'ذكر',   en: 'Male'   },
                { key: 'female', ar: 'أنثى',  en: 'Female' },
              ].map((g) => {
                const isActive = gender === g.key;
                return (
                  <TouchableOpacity
                    key={g.key}
                    style={[styles.genderPill, isActive && styles.genderPillActive]}
                    onPress={() => setGender(g.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.genderText, isActive && styles.genderTextActive]}>
                      {isArabic ? g.ar : g.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Terms ── */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                {isArabic
                  ? 'أوافق على الشروط والأحكام'
                  : 'I agree to the Terms & Conditions'}
              </Text>
            </TouchableOpacity>

            {/* ── Create Account button ── */}
            <TouchableOpacity
              style={[styles.primaryBtn, registerMutation.isPending && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
              activeOpacity={0.85}
            >
              {registerMutation.isPending
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.primaryBtnText}>
                    {isArabic ? 'إنشاء الحساب' : 'Create Account'}
                  </Text>}
            </TouchableOpacity>

            {/* ── Footer link ── */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isArabic ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.footerLink}>
                  {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: BG },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 36 },

  // Brand panel
  brandPanel: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 0,
  },
  brandAccent: {
    width: 40,
    height: 3,
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
    marginVertical: 12,
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#6B6B6B',
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },

  // Headings
  brand:    { fontSize: 26, fontWeight: '800', color: BLACK, textAlign: 'center', marginBottom: 10 },
  title:    { fontSize: 22, fontWeight: '700', color: BLACK, textAlign: 'center', marginBottom: 6  },
  subtitle: { fontSize: 14, color: GRAY,  textAlign: 'center', marginBottom: 26 },

  // Label
  label: { fontSize: 13, fontWeight: '600', color: DARK_GRAY, marginBottom: 6 },

  // Input row
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  inputIcon:  { marginRight: 10 },
  inputField: { flex: 1, fontSize: 15, color: BLACK },

  // Gender pills
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  genderPill: {
    flex: 1,
    height: 46,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderPillActive: { backgroundColor: BLACK, borderColor: BLACK },
  genderText:       { fontSize: 14, color: DARK_GRAY, fontWeight: '500' },
  genderTextActive: { color: '#FFFFFF', fontWeight: '600' },

  // Terms checkbox
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxActive: { backgroundColor: BLACK, borderColor: BLACK },
  termsText:      { flex: 1, fontSize: 13, color: DARK_GRAY, lineHeight: 18 },

  // Primary button
  primaryBtn: {
    height: 50,
    backgroundColor: BLACK,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  btnDisabled:    { opacity: 0.6 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Footer
  footer:     { flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  footerText: { fontSize: 13, color: GRAY },
  footerLink: { fontSize: 13, fontWeight: '700', color: BLACK },
});
