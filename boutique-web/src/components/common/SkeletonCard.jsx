export default function SkeletonCard({ imageHeight = 220 }) {
  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      }}
    >
      <div style={{ height: `${imageHeight}px`, background: 'var(--theme-border)' }} />
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '14px', borderRadius: '6px', background: 'var(--theme-border)', width: '80%' }} />
        <div style={{ height: '12px', borderRadius: '6px', background: 'var(--theme-border)', width: '55%' }} />
        <div style={{ height: '16px', borderRadius: '6px', background: 'var(--theme-border)', width: '40%' }} />
        <div style={{ height: '38px', borderRadius: '50px', background: 'var(--theme-border)', marginTop: '4px' }} />
      </div>
    </div>
  );
}
