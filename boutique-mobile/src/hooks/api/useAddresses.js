import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

export const useAddresses = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await api.get('/user/addresses');
      return data.data ?? [];
    },
    enabled: isAuthenticated,
    initialData: [],
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressData) => api.post('/user/addresses', addressData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/user/addresses/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/user/addresses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};
