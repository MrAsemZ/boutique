function Placeholder({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--theme-text-secondary)' }}>{name} — coming soon</p>
    </div>
  );
}

export function LoginPage() { return <Placeholder name="Login Page" />; }
export function RegisterPage() { return <Placeholder name="Register Page" />; }
export function ForgotPasswordPage() { return <Placeholder name="Forgot Password Page" />; }
