import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export function useCategories() {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['categories', i18n.language],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });
}

export function useCategoryProducts(slug, filters = {}) {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['categories', slug, 'products', filters, i18n.language],
    queryFn: () =>
      api.get(`/categories/${slug}/products`, { params: filters }).then((r) => r.data),
    enabled: !!slug,
  });
}
