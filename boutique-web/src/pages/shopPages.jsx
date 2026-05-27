function Placeholder({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--theme-text-secondary)' }}>{name} — coming soon</p>
    </div>
  );
}

export function ProductListingPage() { return <Placeholder name="Shop / Product Listing Page" />; }
export function ProductDetailPage() { return <Placeholder name="Product Detail Page" />; }
