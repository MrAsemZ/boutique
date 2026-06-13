import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

export const useWishlist = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/wishlist');
      return data.data?.items ?? [];
    },
    enabled: isAuthenticated,
    initialData: [],
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, isInWishlist }) => {
      if (isInWishlist) {
        await api.delete(`/wishlist/${productId}`);
      } else {
        await api.post('/wishlist', { product_id: productId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
};
