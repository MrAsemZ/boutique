function Placeholder({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--theme-text-secondary)' }}>{name} — coming soon</p>
    </div>
  );
}

export function CartPage() { return <Placeholder name="Cart Page" />; }
export function CheckoutPage() { return <Placeholder name="Checkout Page" />; }
export function OrderSuccessPage() { return <Placeholder name="Order Success Page" />; }
export function OrderCancelledPage() { return <Placeholder name="Order Cancelled Page" />; }
