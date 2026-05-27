import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });
}

export function useCategoryProducts(slug, filters = {}) {
  return useQuery({
    queryKey: ['categories', slug, 'products', filters],
    queryFn: () =>
      api.get(`/categories/${slug}/products`, { params: filters }).then((r) => r.data),
    enabled: !!slug,
  });
}
