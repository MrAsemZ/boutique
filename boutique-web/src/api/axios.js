import axios from 'axios';
import i18n from '../i18n/index.js';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const locale = i18n.language ||
                 localStorage.getItem('boutique_locale') ||
                 'ar';
  config.headers['Accept-Language'] = locale;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
