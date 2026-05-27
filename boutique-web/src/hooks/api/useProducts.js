import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get('/products', { params: filters }).then((r) => r.data),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products/featured').then((r) => r.data),
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}
