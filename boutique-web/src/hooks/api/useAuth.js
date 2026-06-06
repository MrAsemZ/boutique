import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { getGuestCart } from '../../utils/guestCart';

function extractAuthData(data) {
  // Handle all possible response shapes:
  //   data.data.data  — if axios response object was passed un-unwrapped
  //   data.data       — normal case: mutationFn does .then(r => r.data), data = Laravel envelope
  //   data            — already fully unwrapped
  const payload = data?.data?.data ?? data?.data ?? data;
  return {
    token: payload?.token ?? null,
    user:  payload?.user  ?? null,
  };
}

export function useLogin() {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials).then((r) => r.data),
    onSuccess: async (data) => {
      const { token, user } = extractAuthData(data);
      if (!token) return;
      login(user, token);
      try {
        if (getGuestCart().items.length > 0) {
          await useCartStore.getState().mergeGuestCartToServer();
        }
      } catch {
        // merge failure must never roll back a successful login
      }
    },
  });
}

export function useRegister() {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: (data) => api.post('/auth/register', data).then((r) => r.data),
    onSuccess: (data) => {
      const { token, user } = extractAuthData(data);
      if (token) login(user, token);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const { logout } = useAuthStore();
  return useMutation({
    mutationFn: () => api.post('/auth/logout').then((r) => r.data),
    onSettled: () => {
      logout();
      useCartStore.getState().clearCart();
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
