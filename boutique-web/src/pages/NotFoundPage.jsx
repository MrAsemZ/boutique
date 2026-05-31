import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <p style={{ color: 'var(--theme-text-primary)', fontSize: '3rem', fontWeight: 700, margin: 0 }}>404</p>
      <p style={{ color: 'var(--theme-text-secondary)', margin: 0, fontWeight: 500 }}>
        {isAr ? 'الصفحة غير موجودة' : 'Page not found'}
      </p>
      <p style={{ color: 'var(--theme-text-hint)', margin: 0, fontSize: '0.9rem' }}>
        {isAr ? 'الصفحة التي تبحث عنها غير موجودة' : 'The page you are looking for does not exist'}
      </p>
      <Link to="/" style={{ color: 'var(--theme-accent)' }}>
        {isAr ? 'العودة للرئيسية' : 'Go Home'}
      </Link>
    </div>
  );
}
