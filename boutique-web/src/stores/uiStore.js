import { create } from 'zustand';

export const useUiStore = create((set) => ({
  cartOpen: false,
  searchOpen: false,
  filterOpen: false,

  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  toggleFilter: () => set((s) => ({ filterOpen: !s.filterOpen })),
  closeAll: () => set({ cartOpen: false, searchOpen: false, filterOpen: false }),
}));
