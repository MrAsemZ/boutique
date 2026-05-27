import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const switchLanguage = async () => {
    const next = isArabic ? 'en' : 'ar';
    await i18n.changeLanguage(next);
    localStorage.setItem('boutique_locale', next);

    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await api.put('/user/locale', { locale: next });
      } catch {
        // locale sync is best-effort; do not block the switch
      }
    }
  };

  return (
    <button
      type="button"
      onClick={switchLanguage}
      aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        border: '1px solid var(--theme-border)',
        background: 'transparent',
        color: 'var(--theme-text-secondary)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      {isArabic ? (
        <>
          <span>EN</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ fontFamily: "'Tajawal', sans-serif" }}>عربي</span>
        </>
      ) : (
        <>
          <span style={{ fontFamily: "'Tajawal', sans-serif" }}>عربي</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>EN</span>
        </>
      )}
    </button>
  );
}

export default LanguageSwitcher;
