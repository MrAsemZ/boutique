import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

function isVendor() {
  return useAuthStore.getState().user?.role === 'vendor';
}

export function useVendorBalance() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['vendor-balance'],
    queryFn: () => api.get('/vendor/balance').then((r) => r.data),
    enabled: user?.role === 'vendor',
  });
}

export function useVendorOrders(page = 1, status = '') {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['vendor-orders', page, status],
    queryFn: () =>
      api.get('/vendor/orders', { params: { page, ...(status ? { status } : {}) } }).then((r) => r.data),
    enabled: user?.role === 'vendor',
  });
}

export function useUpdateVendorOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      api.put(`/vendor/orders/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-orders'] }),
  });
}

export function useApplyAsVendor() {
  return useMutation({
    mutationFn: (data) => api.post('/vendor/apply', data).then((r) => r.data),
  });
}
