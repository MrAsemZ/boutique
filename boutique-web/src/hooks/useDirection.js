import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useDirection() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
    document.documentElement.setAttribute('data-locale', i18n.language);
  }, [i18n.language, dir]);

  return { isRTL, dir, locale: i18n.language };
}
