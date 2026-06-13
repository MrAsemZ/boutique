import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { useLogin } from '../../src/hooks/api/useAuth';

// ── Design tokens ────────────────────────────────────────────────────────────
const BG       = '#F5F3EF';
const BLACK    = '#1A1A1A';
const BORDER   = '#D1D5DB';
const GRAY     = '#888888';
const DARK_GRAY = '#374151';
const FB_BLUE  = '#1877F2';

// ── Reusable input row ───────────────────────────────────────────────────────
function InputRow({ icon, children, style }) {
  return (
    <View style={[styles.inputWrap, style]}>
      <Ionicons name={icon} size={18} color="#9CA3AF" style={styles.inputIcon} />
      {children}
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const loginMutation = useLogin();
  const isArabic = i18n.language === 'ar';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // ── Logic — unchanged ──────────────────────────────────────────────────────
  const handleLogin = () => {
    if (!email.trim() || !password) return;
    loginMutation.mutate(
      { email: email.trim(), password },
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
              {isArabic ? 'مرحباً بعودتك' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {isArabic ? 'سجل دخولك للمتابعة' : 'Sign in to continue'}
            </Text>

            {/* ── Email ── */}
            <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
            </Text>
            <InputRow icon="mail-outline">
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
            </InputRow>

            {/* ── Password ── */}
            <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>
              {isArabic ? 'كلمة المرور' : 'Password'}
            </Text>
            <InputRow icon="lock-closed-outline">
              <TextInput
                style={styles.inputField}
                placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity
                onPress={() => setShowPass((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </InputRow>

            {/* ── Forgot password ── */}
            <TouchableOpacity
              style={{ alignSelf: isArabic ? 'flex-start' : 'flex-end', marginBottom: 22 }}
              onPress={() => Alert.alert('', isArabic ? 'قريباً' : 'Coming soon')}
            >
              <Text style={styles.forgotText}>
                {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </Text>
            </TouchableOpacity>

            {/* ── Login button ── */}
            <TouchableOpacity
              style={[styles.primaryBtn, loginMutation.isPending && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
              activeOpacity={0.85}
            >
              {loginMutation.isPending
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.primaryBtnText}>
                    {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                  </Text>}
            </TouchableOpacity>

            {/* ── Divider ── */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{isArabic ? 'أو' : 'or'}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── Google ── */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
              <AntDesign name="google" size={18} color="#DB4437" />
              <Text style={styles.googleBtnText}>
                {isArabic ? 'المتابعة مع Google' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* ── Facebook ── */}
            <TouchableOpacity style={styles.facebookBtn} activeOpacity={0.85}>
              <FontAwesome name="facebook" size={18} color="#FFFFFF" />
              <Text style={styles.facebookBtnText}>
                {isArabic ? 'المتابعة مع Facebook' : 'Continue with Facebook'}
              </Text>
            </TouchableOpacity>

            {/* ── Footer link ── */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isArabic ? 'ليس لديك حساب؟' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.footerLink}>
                  {isArabic ? 'إنشاء حساب' : 'Create Account'}
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

  // Forgot
  forgotText: { fontSize: 13, color: GRAY },

  // Primary button
  primaryBtn: {
    height: 50,
    backgroundColor: BLACK,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  btnDisabled:     { opacity: 0.6 },
  primaryBtnText:  { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Divider
  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { fontSize: 12, color: '#9CA3AF' },

  // Google button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  googleBtnText: { fontSize: 15, fontWeight: '500', color: BLACK },

  // Facebook button
  facebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: 100,
    backgroundColor: FB_BLUE,
    marginBottom: 26,
  },
  facebookBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  // Footer
  footer:     { flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  footerText: { fontSize: 13, color: GRAY },
  footerLink: { fontSize: 13, fontWeight: '700', color: BLACK },
});
