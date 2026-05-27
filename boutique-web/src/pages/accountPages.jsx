function Placeholder({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--theme-text-secondary)' }}>{name} — coming soon</p>
    </div>
  );
}

export function ProfilePage() { return <Placeholder name="Account / Profile Page" />; }
export function AddressPage() { return <Placeholder name="Addresses Page" />; }
export function WishlistPage() { return <Placeholder name="Wishlist Page" />; }
