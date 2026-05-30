import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SectionWrapper({ title, titleEn, viewAllLink, children }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <section>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '32px',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
            {isArabic ? title : titleEn}
          </h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              style={{ color: 'var(--theme-accent)', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}
            >
              {isArabic ? 'عرض الكل' : 'View All'}
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
