import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

// ── Orders ──────────────────────────────────────────────────────────────────

export function useAdminOrders(filters = {}, page = 1) {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['admin', 'orders', filters, page, i18n.language],
    queryFn: () =>
      api.get('/admin/orders', { params: { ...filters, page } }).then((r) => r.data),
  });
}

export function useAdminOrdersToday() {
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ['admin', 'orders', 'today', today],
    queryFn: () =>
      api.get('/admin/orders', { params: { date_from: today, date_to: today } }).then((r) => r.data),
  });
}

export function useUpdateAdminOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }) =>
      api.put(`/admin/orders/${id}/status`, { status, notes }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });
}

// ── Vendors ──────────────────────────────────────────────────────────────────

export function useAdminVendors(status = '', page = 1) {
  return useQuery({
    queryKey: ['admin', 'vendors', status, page],
    queryFn: () =>
      api.get('/admin/vendors', { params: { status: status || undefined, page } }).then((r) => r.data),
  });
}

export function useApproveVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.put(`/admin/vendors/${id}/approve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vendors'] }),
  });
}

export function useRejectVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      api.put(`/admin/vendors/${id}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vendors'] }),
  });
}

// ── Payouts ──────────────────────────────────────────────────────────────────

export function useAdminPayouts(page = 1) {
  return useQuery({
    queryKey: ['admin', 'payouts', page],
    queryFn: () => api.get('/admin/payouts', { params: { page } }).then((r) => r.data),
  });
}

export function useMarkVendorPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vendorId) =>
      api.put(`/admin/payouts/${vendorId}/mark-paid`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payouts'] }),
  });
}

// ── Users ────────────────────────────────────────────────────────────────────

export function useAdminUsers(filters = {}, page = 1) {
  return useQuery({
    queryKey: ['admin', 'users', filters, page],
    queryFn: () =>
      api.get('/admin/users', { params: { ...filters, page } }).then((r) => r.data),
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      api.put(`/admin/users/${id}/toggle-status`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

// ── Vouchers ─────────────────────────────────────────────────────────────────

export function useAdminVouchers(filters = {}, page = 1) {
  return useQuery({
    queryKey: ['admin', 'vouchers', filters, page],
    queryFn: () =>
      api.get('/admin/vouchers', { params: { ...filters, page } }).then((r) => r.data),
  });
}

export function useCreateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/admin/vouchers', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vouchers'] }),
  });
}

export function useUpdateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/admin/vouchers/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vouchers'] }),
  });
}

export function useDeleteVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/vouchers/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vouchers'] }),
  });
}
