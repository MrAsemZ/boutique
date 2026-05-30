import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export function useProducts(filters = {}) {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['products', filters, i18n.language],
    queryFn: () => api.get('/products', { params: filters }).then((r) => r.data),
  });
}

export function useFeaturedProducts() {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['products', 'featured', i18n.language],
    queryFn: () => api.get('/products/featured').then((r) => r.data),
  });
}

export function useProduct(slug) {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['product', slug, i18n.language],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}
