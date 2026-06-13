import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ar from './locales/ar.json';
import en from './locales/en.json';

const LOCALE_KEY = 'boutique_locale';

export const changeLanguage = async (lang) => {
  await AsyncStorage.setItem(LOCALE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export const getStoredLocale = async () => {
  try {
    return (await AsyncStorage.getItem(LOCALE_KEY)) || 'ar';
  } catch {
    return 'ar';
  }
};

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: 'ar',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
