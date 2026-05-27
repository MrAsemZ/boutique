import axios from 'axios';
import i18n from '../i18n/index.js';

const locale = localStorage.getItem('boutique_locale') || 'ar';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': locale,
  },
});

i18n.on('languageChanged', (lng) => {
  api.defaults.headers.common['Accept-Language'] = lng;
});

export default api;