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

// Each wishlist item shape from the API:
// { id, variant: { id, size, color, stock }, product: { id, name, slug, ... } }
// POST /wishlist   → { product_variant_id }
// DELETE /wishlist/{wishlistItemId}  → uses item.id, NOT product.id

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ variantId, wishlistItemId, isInWishlist }) => {
      if (isInWishlist) {
        await api.delete(`/wishlist/${wishlistItemId}`);
      } else {
        await api.post('/wishlist', { product_variant_id: variantId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
};
