import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
    enabled: isAuthenticated,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/cart', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/cart/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/cart/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/cart').then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}
