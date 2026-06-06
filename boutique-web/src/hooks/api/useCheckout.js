import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import { useCartStore } from '../../stores/cartStore';

export function useCheckout() {
  return useMutation({
    mutationFn: (payload) => api.post('/checkout', payload).then((r) => r.data),
    onSuccess: () => {
      useCartStore.getState().clearCart();
    },
  });
}

export function useValidateVoucher() {
  return useMutation({
    mutationFn: ({ code, cart_total }) =>
      api.post('/vouchers/validate', { code, cart_total }).then((r) => r.data),
  });
}

export function useCliqSimulate() {
  return useMutation({
    mutationFn: (cliqRequestId) =>
      api.post(`/payments/cliq/simulate/${cliqRequestId}`).then((r) => r.data),
  });
}

export function useCancelOrder() {
  return useMutation({
    mutationFn: (orderId) =>
      api.put(`/orders/${orderId}/cancel`).then((r) => r.data),
  });
}
