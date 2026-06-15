import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: (data) => api.put('/user/profile', data),
  });

export const useUpdatePassword = () =>
  useMutation({
    mutationFn: (data) => api.put('/user/password', data),
  });
