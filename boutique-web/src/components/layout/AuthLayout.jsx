export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--theme-bg)',
      }}
    >
      {/* Decorative panel — hidden on mobile, first in DOM so it goes right in RTL */}
      <div
        className="hidden lg:flex"
        style={{
          flex: '0 0 44%',
          background: 'var(--theme-accent)',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating decoration cards */}
        <div style={{ position: 'absolute', top: '18%', insetInlineStart: '8%', width: '120px', height: '160px', borderRadius: '14px', background: 'rgba(255,255,255,0.10)', transform: 'rotate(-8deg)' }} />
        <div style={{ position: 'absolute', bottom: '22%', insetInlineEnd: '6%', width: '100px', height: '140px', borderRadius: '14px', background: 'rgba(255,255,255,0.14)', transform: 'rotate(6deg)' }} />
        <div style={{ position: 'absolute', top: '58%', insetInlineStart: '12%', width: '80px', height: '110px', borderRadius: '14px', background: 'rgba(255,255,255,0.07)', transform: 'rotate(-3deg)' }} />
        <div style={{ position: 'absolute', top: '8%', insetInlineEnd: '16%', width: '60px', height: '80px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', transform: 'rotate(12deg)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'var(--theme-bg)' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              lineHeight: 1.5,
              margin: '0 0 14px',
              fontFamily: "'Tajawal', sans-serif",
              letterSpacing: 0,
            }}
          >
            أناقتك تبدأ هنا
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.82, margin: 0, lineHeight: 1.6 }}>
            Discover fashion that speaks your style
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--theme-surface)',
            border: '1px solid var(--theme-border)',
            borderRadius: '16px',
            padding: '40px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
