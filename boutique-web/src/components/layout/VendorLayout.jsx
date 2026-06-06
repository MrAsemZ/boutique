import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/api/useAuth';

const VENDOR_NAV = [
  {
    key: 'dashboard',
    path: '/vendor/dashboard',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    key: 'orders',
    path: '/vendor/orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    key: 'balance',
    path: '/vendor/balance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    key: 'store',
    path: '/vendor/profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
];

export default function VendorLayout({ children }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const logout = useLogout();

  const initials = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const handleLogout = () => {
    logout.mutate(undefined, { onSettled: () => navigate('/login') });
  };

  return (
    <>
      <style>{`
        .vendor-shell { display: flex; min-height: calc(100vh - 64px); background: var(--theme-bg); }
        .vendor-sidebar {
          width: 240px; flex-shrink: 0;
          background: var(--theme-surface);
          border-inline-end: 1px solid var(--theme-border);
          display: flex; flex-direction: column;
          padding: 28px 0 20px;
          position: sticky; top: 64px;
          height: calc(100vh - 64px); overflow-y: auto;
        }
        .vendor-badge {
          display: inline-block; padding: 3px 10px; border-radius: 50px;
          font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.04em;
          background: color-mix(in srgb, var(--theme-accent) 15%, transparent);
          color: var(--theme-accent); margin: 6px auto 0; text-align: center;
        }
        .vendor-nav {
          margin-top: 24px; flex: 1;
          display: flex; flex-direction: column; gap: 2px; padding: 0 8px;
        }
        .vendor-nav a, .vendor-nav button.vendor-logout {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 10px;
          font-size: 0.9rem; font-weight: 500;
          color: var(--theme-text-secondary); text-decoration: none;
          transition: background 0.15s, color 0.15s;
          background: none; border: none; cursor: pointer;
          width: 100%; text-align: start;
        }
        .vendor-nav a:hover, .vendor-nav button.vendor-logout:hover {
          background: color-mix(in srgb, var(--theme-accent) 8%, transparent);
          color: var(--theme-text-primary);
        }
        .vendor-nav a.active {
          background: color-mix(in srgb, var(--theme-accent) 12%, transparent);
          color: var(--theme-accent); font-weight: 600;
        }
        .vendor-logout-wrap {
          padding: 12px 8px 0; border-top: 1px solid var(--theme-border); margin: 8px 0 0;
        }
        .vendor-main { flex: 1; padding: 32px; min-width: 0; }
        .vendor-mobile-tabs {
          display: none; overflow-x: auto; gap: 4px;
          padding: 10px 16px; background: var(--theme-surface);
          border-bottom: 1px solid var(--theme-border); scrollbar-width: none;
        }
        .vendor-mobile-tabs::-webkit-scrollbar { display: none; }
        .vendor-tab {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 8px 12px; border-radius: 10px; font-size: 0.7rem; font-weight: 500;
          color: var(--theme-text-secondary); text-decoration: none;
          white-space: nowrap; transition: background 0.15s, color 0.15s; flex-shrink: 0;
        }
        .vendor-tab.active {
          background: color-mix(in srgb, var(--theme-accent) 12%, transparent);
          color: var(--theme-accent); font-weight: 600;
        }
        @media (max-width: 768px) {
          .vendor-sidebar { display: none; }
          .vendor-mobile-tabs { display: flex; }
          .vendor-main { padding: 20px 16px; }
        }
      `}</style>

      {/* Mobile tabs */}
      <nav className="vendor-mobile-tabs">
        {VENDOR_NAV.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.end}
            className={({ isActive }) => 'vendor-tab' + (isActive ? ' active' : '')}
          >
            {item.icon}
            {t(`vendor.${item.key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="vendor-shell">
        <aside className="vendor-sidebar">
          {/* Avatar */}
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontSize: '1.375rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--theme-text-primary)', textAlign: 'center', padding: '0 16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name ?? ''}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary)', textAlign: 'center', padding: '0 16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
            {user?.email ?? ''}
          </div>
          <div className="vendor-badge">Vendor</div>

          <nav className="vendor-nav">
            {VENDOR_NAV.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {item.icon}
                {t(`vendor.${item.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="vendor-logout-wrap">
            <nav className="vendor-nav" style={{ margin: 0 }}>
              <button className="vendor-logout" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {t('account.logout')}
              </button>
            </nav>
          </div>
        </aside>

        <main className="vendor-main">{children}</main>
      </div>
    </>
  );
}
