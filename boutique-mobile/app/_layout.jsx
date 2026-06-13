import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import '../src/i18n/index';
import useAuthStore from '../src/stores/authStore';
import useCartStore from '../src/stores/cartStore';
import { getStoredLocale } from '../src/i18n/index';
import i18n from '../src/i18n/index';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);
  const loadGuestCart = useCartStore((s) => s.loadGuestCart);

  useEffect(() => {
    (async () => {
      const locale = await getStoredLocale();
      await i18n.changeLanguage(locale);

      const isRTL = locale === 'ar';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
      }

      await initFromStorage();
      await loadGuestCart();
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="shop/[slug]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="checkout/index" />
        <Stack.Screen name="checkout/success" options={{ gestureEnabled: false }} />
        <Stack.Screen name="orders/index" />
        <Stack.Screen name="orders/[id]" />
      </Stack>
    </QueryClientProvider>
  );
}
