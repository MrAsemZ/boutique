import { create } from 'zustand';

export const useWishlistStore = create((set) => ({
  items: [],
  itemCount: 0,

  setWishlist: (items) => set({ items, itemCount: items.length }),

  addItem: (item) =>
    set((state) => {
      const items = [...state.items, item];
      return { items, itemCount: items.length };
    }),

  removeItem: (variantId) =>
    set((state) => {
      const items = state.items.filter((i) => i.variant_id !== variantId);
      return { items, itemCount: items.length };
    }),
}));
