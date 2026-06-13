import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import useCartStore from '../../stores/cartStore';
import useAuthStore from '../../stores/authStore';

export const useCart = () => {
  const setCart = useCartStore((s) => s.setCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      setCart(data.data);
      return data.data;
    },
    enabled: isAuthenticated,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variant_id, quantity }) =>
      api.post('/cart', { variant_id, quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => api.delete(`/cart/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }) =>
      api.put(`/cart/${itemId}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useApplyVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code) => api.post('/cart/voucher', { code }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};
