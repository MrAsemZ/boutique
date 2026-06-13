import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

export const useLogin = () => {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      login(data.data.user, data.data.token);
    },
  });
};

export const useRegister = () => {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/auth/register', payload);
      return data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        login(data.data.user, data.data.token);
      }
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => logout(),
  });
};
