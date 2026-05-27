const sizeMap = { sm: 16, md: 32, lg: 48 };

export default function LoadingSpinner({ size = 'md' }) {
  const px = sizeMap[size];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: 'var(--theme-accent)', animation: 'spin 0.8s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
        <path
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          fill="currentColor"
          opacity="0.75"
        />
      </svg>
    </div>
  );
}
