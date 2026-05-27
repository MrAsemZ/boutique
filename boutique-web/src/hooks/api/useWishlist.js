import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then((r) => r.data),
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/wishlist', data).then((r) => r.data),
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
