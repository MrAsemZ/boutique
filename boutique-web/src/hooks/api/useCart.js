import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const { items, itemCount, subtotal } = useCartStore();

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
    enabled: isAuthenticated,
  });

  // Sync server cart data into the store whenever it loads/updates
  useEffect(() => {
    if (isAuthenticated && query.data) {
      useCartStore.getState().setCart(query.data?.data ?? query.data);
    }
  }, [isAuthenticated, query.data]);

  if (!isAuthenticated) {
    return { items, itemCount, subtotal, isLoading: false, isGuest: true };
  }

  const data = query.data?.data ?? query.data;
  return {
    items: data?.items ?? items,
    itemCount: data?.item_count ?? itemCount,
    subtotal: data?.subtotal ?? subtotal,
    isLoading: query.isLoading,
    isGuest: false,
  };
}

function syncCartToStore(data) {
  // CartController always returns the full cart in the response body.
  // Sync it directly so cartStore (and the Navbar badge) updates immediately,
  // regardless of whether a component calling useCart() is mounted.
  if (data && !data.guest) {
    useCartStore.getState().setCart(data?.data ?? data);
  }
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variant_id, quantity, product, variant }) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        useCartStore.getState().addGuestItem(product, variant, quantity);
        return Promise.resolve({ success: true, guest: true });
      }
      return api.post('/cart', { variant_id, quantity }).then((r) => r.data);
    },
    onSuccess: (data) => {
      syncCartToStore(data);
      if (!data?.guest) {
        qc.invalidateQueries({ queryKey: ['cart'] });
      }
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, variantId, quantity, ...rest }) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        useCartStore.getState().updateGuestItem(variantId, quantity);
        return Promise.resolve({ success: true, guest: true });
      }
      return api.put(`/cart/${id}`, { quantity, ...rest }).then((r) => r.data);
    },
    onSuccess: (data) => {
      syncCartToStore(data);
      if (!data?.guest) {
        qc.invalidateQueries({ queryKey: ['cart'] });
      }
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, variantId }) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        useCartStore.getState().removeGuestItem(variantId);
        return Promise.resolve({ success: true, guest: true });
      }
      return api.delete(`/cart/${id}`).then((r) => r.data);
    },
    onSuccess: (data) => {
      syncCartToStore(data);
      if (!data?.guest) {
        qc.invalidateQueries({ queryKey: ['cart'] });
      }
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        useCartStore.getState().clearGuestCart();
        return Promise.resolve({ success: true, guest: true });
      }
      return api.delete('/cart').then((r) => r.data);
    },
    onSuccess: (data) => {
      syncCartToStore(data);
      if (!data?.guest) {
        qc.invalidateQueries({ queryKey: ['cart'] });
      }
    },
  });
}
