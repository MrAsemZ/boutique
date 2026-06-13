import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../src/stores/authStore';
import { themes } from '../../src/theme/colors';
import { SCREEN_PADDING, BUTTON_HEIGHT } from '../../src/theme/styles';

const theme = themes.default;

// ── Nav items matching web AccountLayout ─────────────────────────────────────

const NAV_ITEMS = [
  { key: 'orders',    icon: 'bag-outline',           path: '/orders'           },
  { key: 'wishlist',  icon: 'heart-outline',         path: '/account/wishlist' },
  { key: 'profile',   icon: 'person-outline',        path: '/account/profile'  },
  { key: 'addresses', icon: 'location-outline',      path: '/account/addresses' },
  { key: 'password',  icon: 'lock-closed-outline',   path: '/account/password' },
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
  const { t } = useTranslation();
  const router = useRouter();
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout          = useAuthStore((s) => s.logout);

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

  // ── Guest state ──────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.guestWrap}>
          <Ionicons name="person-circle-outline" size={80} color={theme.accent} />
          <Text style={styles.guestTitle}>مرحباً بك في بوتيك</Text>
          <Text style={styles.guestSub}>سجّل دخولك للمتابعة</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginBtnText}>{t('auth.login')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerBtnText}>{t('auth.register')}</Text>
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
  safe:   { flex: 1, backgroundColor: theme.bg },
  scroll: { flexGrow: 1, paddingHorizontal: SCREEN_PADDING, paddingTop: 8 },

  // Guest
  guestWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  guestTitle: {
    fontSize: 22, fontWeight: '700', color: theme.textPrimary,
    marginTop: 16, marginBottom: 8, textAlign: 'center',
  },
  guestSub: { fontSize: 14, color: theme.textSecondary, marginBottom: 36, textAlign: 'center' },
  loginBtn: {
    backgroundColor: theme.accent, borderRadius: 50,
    height: BUTTON_HEIGHT, width: '100%',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  loginBtnText:    { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  registerBtn: {
    borderWidth: 1.5, borderColor: theme.accent, borderRadius: 50,
    height: BUTTON_HEIGHT, width: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  registerBtnText: { color: theme.accent, fontSize: 16, fontWeight: '600' },

  // User section — centered
  userSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  userName:   { fontSize: 17, fontWeight: '700', color: theme.textPrimary, textAlign: 'center' },
  userEmail:  { fontSize: 13, color: theme.textSecondary, marginTop: 3, textAlign: 'center' },

  // Menu card
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
