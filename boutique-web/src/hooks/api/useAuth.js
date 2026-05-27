import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

export function useLogin() {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials).then((r) => r.data),
    onSuccess: (data) => login(data.user, data.token),
  });
}

export function useRegister() {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: (data) => api.post('/auth/register', data).then((r) => r.data),
    onSuccess: (data) => login(data.user, data.token),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const { logout } = useAuthStore();
  return useMutation({
    mutationFn: () => api.post('/auth/logout').then((r) => r.data),
    onSettled: () => {
      logout();
      qc.clear();
    },
  });
}

export function useMe() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
    enabled: !!token,
  });
}
