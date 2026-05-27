import { useTranslation } from 'react-i18next';

export default function ErrorMessage({ onRetry }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '48px 16px',
      }}
    >
      <p style={{ color: 'var(--theme-text-secondary)', margin: 0 }}>{t('common.error')}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--theme-accent)',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
