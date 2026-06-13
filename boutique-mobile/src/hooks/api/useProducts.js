import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export const useProducts = (params = {}) => {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['products', i18n.language, params],
    queryFn: async () => {
      const { data } = await api.get('/products', { params });
      return data;
    },
  });
};

export const useFeaturedProducts = () => {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['products', 'featured', i18n.language],
    queryFn: async () => {
      try {
        const { data } = await api.get('/products/featured');
        return Array.isArray(data.data) ? data.data : [];
      } catch {
        const { data } = await api.get('/products', {
          params: { sort: 'newest', per_page: 6 },
        });
        return Array.isArray(data.data) ? data.data : [];
      }
    },
  });
};

export const useProduct = (slug) => {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['product', slug, i18n.language],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
};
