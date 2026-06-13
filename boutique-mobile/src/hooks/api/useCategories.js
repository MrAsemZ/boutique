import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export const useCategories = () => {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['categories', i18n.language],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    },
  });
};
