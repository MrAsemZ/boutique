import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <p style={{ color: 'var(--theme-text-primary)', fontSize: '3rem', fontWeight: 700, margin: 0 }}>404</p>
      <p style={{ color: 'var(--theme-text-secondary)', margin: 0 }}>Page not found</p>
      <Link to="/" style={{ color: 'var(--theme-accent)' }}>Go Home</Link>
    </div>
  );
}
