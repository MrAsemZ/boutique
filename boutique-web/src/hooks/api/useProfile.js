import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

export function useUpdateProfile() {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: (data) => api.put('/user/profile', data).then((r) => r.data),
    onSuccess: (res) => {
      const user = res?.data ?? res;
      if (user) setUser(user);
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data) => api.put('/user/password', data).then((r) => r.data),
  });
}
