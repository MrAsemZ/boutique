function Placeholder({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--theme-text-secondary)' }}>{name} — coming soon</p>
    </div>
  );
}

export function VendorDashboardPage() { return <Placeholder name="Vendor Dashboard Page" />; }
export function AdminDashboardPage() { return <Placeholder name="Admin Dashboard Page" />; }
