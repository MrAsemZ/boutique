function Placeholder({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--theme-text-secondary)' }}>{name} — coming soon</p>
    </div>
  );
}

export function OrderHistoryPage() { return <Placeholder name="My Orders Page" />; }
export function OrderDetailPage() { return <Placeholder name="Order Detail Page" />; }
