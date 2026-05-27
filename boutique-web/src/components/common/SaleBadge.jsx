import { useTranslation } from 'react-i18next';

export default function SaleBadge({ className = '' }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  return (
    <span
      className={className}
      style={{
        position: 'absolute',
        top: '8px',
        insetInlineStart: '8px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 700,
        color: '#fff',
        background: 'var(--theme-badge-sale)',
        letterSpacing: isArabic ? 0 : '0.05em',
        lineHeight: 1.5,
      }}
    >
      {isArabic ? 'خصم' : 'SALE'}
    </span>
  );
}
