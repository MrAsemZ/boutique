import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import useAuthStore from '../../src/stores/authStore';
import { useAppTheme } from '../../src/context/ThemeContext';
import { SCREEN_PADDING } from '../../src/theme/styles';

const NAV_ITEMS = [
  { key: 'orders',    icon: 'bag-outline',         path: '/orders'            },
  { key: 'wishlist',  icon: 'heart-outline',       path: '/account/wishlist'  },
  { key: 'profile',   icon: 'person-outline',      path: '/account/profile'   },
  { key: 'addresses', icon: 'location-outline',    path: '/account/addresses' },
  { key: 'password',  icon: 'lock-closed-outline', path: '/account/password'  },
];

export default function AccountScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

  // ── Guest state ───────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        {/* Subtle decorative blob */}
        <View style={[styles.guestBlob, { backgroundColor: theme.accent }]} pointerEvents="none" />
        <View style={styles.guestWrap}>
          <Text style={[styles.guestLogo, { color: theme.textPrimary }]}>Boutique</Text>
          <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>
            {isArabic ? 'مرحباً بك في بوتيك' : 'Welcome to Boutique'}
          </Text>
          <Text style={[styles.guestSub, { color: theme.textSecondary }]}>
            {isArabic
              ? 'سجل دخولك للوصول إلى حسابك وطلباتك'
              : 'Sign in to access your account and orders'}
          </Text>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {isArabic ? 'تسجيل الدخول' : 'Login'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.registerBtn, { borderColor: theme.accent }]}
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.85}
          >
            <Text style={[styles.registerBtnText, { color: theme.accent }]}>
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

        {/* Avatar + name + email */}
        <View style={styles.userSection}>
          {/* Avatar ring */}
          <View style={[styles.avatarRing, { borderColor: theme.border }]}>
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name || '—'}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || '—'}</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {NAV_ITEMS.map((item, idx) => (
            <View key={item.key}>
              {idx > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push(item.path)}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  {/* Icon in accent color with subtle bg circle */}
                  <View style={[styles.iconCircle, { backgroundColor: theme.bg }]}>
                    <Ionicons name={item.icon} size={18} color={theme.accent} />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                    {t(`account.${item.key}`)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={16} color={theme.border} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="log-out-outline" size={18} color="#E53E3E" />
              </View>
              <Text style={[styles.menuLabel, { color: '#E53E3E' }]}>{t('auth.logout')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bg },

    // Guest screen
    guestBlob: {
      position: 'absolute', width: 260, height: 260, borderRadius: 130,
      top: -80, right: -60, opacity: 0.05, zIndex: 0,
    },
    guestWrap: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 32, paddingBottom: 40,
    },
    guestLogo: {
      fontSize: 26, fontWeight: '800',
      marginBottom: 28, letterSpacing: -0.5,
    },
    guestTitle: {
      fontSize: 22, fontWeight: '700',
      textAlign: 'center', marginBottom: 10,
    },
    guestSub: {
      fontSize: 14, textAlign: 'center',
      lineHeight: 20, marginBottom: 36,
    },
    loginBtn: {
      borderRadius: 100, height: 52, width: '100%',
      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    loginBtnText:    { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    registerBtn: {
      borderWidth: 1.5, borderRadius: 100,
      height: 52, width: '100%',
      alignItems: 'center', justifyContent: 'center',
    },
    registerBtnText: { fontSize: 16, fontWeight: '600' },

    // Authenticated screen
    scroll: { flexGrow: 1, paddingHorizontal: SCREEN_PADDING, paddingTop: 8 },

    userSection: { alignItems: 'center', paddingVertical: 28 },
    avatarRing: {
      borderWidth: 2, borderRadius: 42,
      padding: 3, marginBottom: 12,
    },
    avatar: {
      width: 68, height: 68, borderRadius: 34,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
    userName:   { fontSize: 17, fontWeight: '700', textAlign: 'center' },
    userEmail:  { fontSize: 13, marginTop: 3, textAlign: 'center' },

    menuCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1, borderColor: theme.border,
      overflow: 'hidden', marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 6,
      elevation: 2,
    },
    logoutCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1, borderColor: theme.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 6,
      elevation: 2,
    },
    menuItem: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: SCREEN_PADDING, paddingVertical: 13,
    },
    menuLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuLabel: { fontSize: 15, fontWeight: '500' },
    iconCircle: {
      width: 34, height: 34, borderRadius: 17,
      alignItems: 'center', justifyContent: 'center',
    },
    divider: { height: 1, backgroundColor: theme.border, marginLeft: 62 },
  });
}
