export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '64px 16px',
        textAlign: 'center',
      }}
    >
      {icon && <div style={{ fontSize: '3rem', lineHeight: 1 }}>{icon}</div>}
      {title && (
        <p style={{ color: 'var(--theme-text-primary)', fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>
          {title}
        </p>
      )}
      {subtitle && (
        <p style={{ color: 'var(--theme-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          {subtitle}
        </p>
      )}
      {action && action}
    </div>
  );
}
