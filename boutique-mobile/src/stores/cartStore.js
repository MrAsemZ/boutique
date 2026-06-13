import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_CART_KEY = 'guest_cart';

const useCartStore = create((set, get) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  isGuest: true,

  setCart: (cartData) => {
    const items = cartData?.items ?? [];
    const itemCount = cartData?.item_count ?? items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cartData?.subtotal ?? 0;
    set({ items, itemCount, subtotal });
  },

  clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),

  setIsGuest: (isGuest) => set({ isGuest }),

  // Guest cart helpers (stored locally when not authenticated)
  loadGuestCart: async () => {
    try {
      const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
      if (raw) {
        const items = JSON.parse(raw);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items, itemCount, subtotal });
      }
    } catch {}
  },

  saveGuestCart: async () => {
    try {
      await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(get().items));
    } catch {}
  },

  clearGuestCart: async () => {
    await AsyncStorage.removeItem(GUEST_CART_KEY);
    set({ items: [], itemCount: 0, subtotal: 0 });
  },
}));

export default useCartStore;
