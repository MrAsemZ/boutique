import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

export function useWishlist() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then((r) => r.data),
    enabled: isAuthenticated,
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post('/wishlist', {
        product_variant_id: data.product_variant_id ?? data.variantId,
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/wishlist/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}
