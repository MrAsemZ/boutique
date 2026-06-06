import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

export function useAddresses() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/user/addresses').then((r) => r.data),
    enabled: isAuthenticated,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/user/addresses', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/user/addresses/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}
