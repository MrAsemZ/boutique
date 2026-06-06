import { create } from 'zustand';
import {
  getGuestCart,
  addToGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
  clearGuestCart as clearGuestUtil,
} from '../utils/guestCart';
import api from '../api/axios';
import { queryClient } from '../lib/queryClient';

function deriveGuestState() {
  const { items } = getGuestCart();
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
  };
}

// Seed initial state from localStorage so Navbar shows count before any page mounts
const hasToken = !!localStorage.getItem('auth_token');
const initial = hasToken ? { items: [], itemCount: 0, subtotal: 0 } : deriveGuestState();

export const useCartStore = create((set, get) => ({
  ...initial,
  isGuest: !hasToken,

  setCart: (cartData) => {
    const items = cartData?.items ?? [];
    const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    const subtotal = items.reduce((sum, item) => sum + (item.total ?? 0), 0);
    set({ items, itemCount, subtotal, isGuest: false });
  },

  setGuestCart: () => {
    const state = deriveGuestState();
    set({ ...state, isGuest: true });
  },

  addGuestItem: (product, variant, quantity = 1) => {
    addToGuestCart(product, variant, quantity);
    get().setGuestCart();
  },

  removeGuestItem: (variantId) => {
    removeFromGuestCart(variantId);
    get().setGuestCart();
  },

  updateGuestItem: (variantId, quantity) => {
    updateGuestCartQuantity(variantId, quantity);
    get().setGuestCart();
  },

  clearGuestCart: () => {
    clearGuestUtil();
    set({ items: [], itemCount: 0, subtotal: 0, isGuest: false });
  },

  clearCart: () => set({ items: [], itemCount: 0, subtotal: 0, isGuest: false }),

  mergeGuestCartToServer: async () => {
    const guestCart = getGuestCart();
    if (!guestCart.items.length) return;

    // CartController::store adds to existing qty on the server side, so we only
    // need to send the guest quantity — no pre-fetch needed.
    for (const guestItem of guestCart.items) {
      try {
        await api.post('/cart', { variant_id: guestItem.variantId, quantity: guestItem.quantity });
      } catch {
        // skip items that fail (e.g. out of stock, inactive variant) and continue
      }
    }

    clearGuestUtil();
    set({ items: [], itemCount: 0, subtotal: 0, isGuest: false });
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  },
}));
