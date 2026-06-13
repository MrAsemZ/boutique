import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../src/stores/authStore';
import { themes } from '../../src/theme/colors';
import { SCREEN_PADDING } from '../../src/theme/styles';

const theme = themes.default;

// ── Nav items matching web AccountLayout ─────────────────────────────────────

const NAV_ITEMS = [
  { key: 'orders',    icon: 'bag-outline',         path: '/orders'            },
  { key: 'wishlist',  icon: 'heart-outline',       path: '/account/wishlist'  },
  { key: 'profile',   icon: 'person-outline',      path: '/account/profile'   },
  { key: 'addresses', icon: 'location-outline',    path: '/account/addresses' },
  { key: 'password',  icon: 'lock-closed-outline', path: '/account/password'  },
];

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={20} color={theme.textSecondary} />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={16} color="#C4BFB8" />
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout          = useAuthStore((s) => s.logout);
  const isArabic        = i18n.language === 'ar';

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleLogout = () => {
    Alert.alert(t('auth.logout'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  // ── Guest state — show login/register options, no redirect ────────────────

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.guestWrap}>
          <Text style={styles.guestLogo}>Boutique</Text>
          <Text style={styles.guestTitle}>
            {isArabic ? 'مرحباً بك في بوتيك' : 'Welcome to Boutique'}
          </Text>
          <Text style={styles.guestSub}>
            {isArabic
              ? 'سجل دخولك للوصول إلى حسابك وطلباتك'
              : 'Sign in to access your account and orders'}
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {isArabic ? 'تسجيل الدخول' : 'Login'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.registerBtnText}>
              {isArabic ? 'إنشاء حساب' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Authenticated state ───────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar + name + email — centered */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || '—'}</Text>
          <Text style={styles.userEmail}>{user?.email || '—'}</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {NAV_ITEMS.map((item, idx) => (
            <View key={item.key}>
              {idx > 0 && <View style={styles.divider} />}
              <MenuItem
                icon={item.icon}
                label={t(`account.${item.key}`)}
                onPress={() => router.push(item.path)}
              />
            </View>
          ))}
        </View>

        {/* Logout — separated */}
        <View style={styles.logoutCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
              <Text style={[styles.menuLabel, styles.menuLabelDanger]}>{t('auth.logout')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },

  // Guest screen
  guestWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  guestLogo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 28,
    letterSpacing: -0.5,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 10,
  },
  guestSub: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
  },
  loginBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 100,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loginBtnText:    { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  registerBtn: {
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    borderRadius: 100,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: { color: '#1A1A1A', fontSize: 16, fontWeight: '600' },

  // Authenticated screen
  scroll: { flexGrow: 1, paddingHorizontal: SCREEN_PADDING, paddingTop: 8 },

  userSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  userName:   { fontSize: 17, fontWeight: '700', color: theme.textPrimary, textAlign: 'center' },
  userEmail:  { fontSize: 13, color: theme.textSecondary, marginTop: 3, textAlign: 'center' },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0EDE8',
    overflow: 'hidden',
    marginBottom: 12,
  },
  logoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0EDE8',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 14,
    borderRadius: 10,
  },
  menuLeft:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel:       { fontSize: 15, color: theme.textPrimary, fontWeight: '500' },
  menuLabelDanger: { color: '#E53E3E' },
  divider:         { height: 1, backgroundColor: '#F5F2EE', marginLeft: 52 },
});
