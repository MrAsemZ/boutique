import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';

const enabled = () => useAuthStore.getState().user?.role === 'vendor';

export function useVendorProducts(filters = {}) {
  const { i18n } = useTranslation();
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['vendor-products', filters, i18n.language],
    queryFn: () => api.get('/vendor/products', { params: filters }).then((r) => r.data),
    enabled: user?.role === 'vendor',
  });
}

export function useVendorProduct(id) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['vendor-product', id],
    queryFn: () => api.get(`/vendor/products/${id}`).then((r) => r.data),
    enabled: !!id && user?.role === 'vendor',
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/vendor/products', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/vendor/products/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['vendor-products'] });
      qc.invalidateQueries({ queryKey: ['vendor-product', id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/vendor/products/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-products'] }),
  });
}

export function useAddVariant(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/vendor/products/${productId}/variants`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-product', productId] }),
  });
}

export function useUpdateVariant(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id: vid, ...data }) =>
      api.put(`/vendor/products/${productId}/variants/${vid}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-product', productId] }),
  });
}

export function useDeleteVariant(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vid) =>
      api.delete(`/vendor/products/${productId}/variants/${vid}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-product', productId] }),
  });
}

export function useAddImage(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/vendor/products/${productId}/images`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-product', productId] }),
  });
}

export function useDeleteImage(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (iid) =>
      api.delete(`/vendor/products/${productId}/images/${iid}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-product', productId] }),
  });
}
