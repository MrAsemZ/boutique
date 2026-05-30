import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import arTranslation from '../locales/ar/translation.json';
import enTranslation from '../locales/en/translation.json';
import { queryClient } from '../lib/queryClient';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: arTranslation },
      en: { translation: enTranslation }
    },
    lng: 'ar',
    fallbackLng: 'en',
    defaultNS: 'translation',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'boutique_locale'
    },
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', () => {
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['product'] });
  queryClient.invalidateQueries({ queryKey: ['categories'] });
});

export default i18n;
