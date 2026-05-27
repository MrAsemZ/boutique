import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,

  setCart: (cartData) => {
    const items = cartData?.items ?? [];
    const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    const subtotal = items.reduce((sum, item) => sum + (item.total ?? 0), 0);
    set({ items, itemCount, subtotal });
  },

  clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
}));
