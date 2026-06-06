import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

export function useOrders(page = 1) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['orders', page],
    queryFn: () => api.get('/orders', { params: { page } }).then((r) => r.data),
    enabled: isAuthenticated,
  });
}

export function useOrder(id) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    enabled: isAuthenticated && !!id,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.put(`/orders/${id}/cancel`).then((r) => r.data),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['orders', String(id)] });
      qc.invalidateQueries({ queryKey: ['orders', Number(id)] });
    },
  });
}
