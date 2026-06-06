import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/api/useAuth';

const ADMIN_NAV = [
  {
    key: 'dashboard',
    path: '/admin/dashboard',
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
    path: '/admin/orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    key: 'vendors',
    path: '/admin/vendors',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: 'payouts',
    path: '/admin/payouts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    key: 'users',
    path: '/admin/users',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key: 'products',
    path: '/admin/products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    key: 'vouchers',
    path: '/admin/vouchers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
];

const STYLES = `
  .admin-root { display: flex; min-height: 100vh; background: var(--theme-bg); }
  .admin-sidebar {
    width: 240px; flex-shrink: 0;
    background: var(--theme-surface);
    border-inline-end: 1px solid var(--theme-border);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .admin-top-bar {
    padding: 20px 16px 16px;
    border-bottom: 1px solid var(--theme-border);
  }
  .admin-top-title {
    font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.04em;
    color: var(--theme-text-hint); text-transform: uppercase;
    margin-bottom: 12px;
  }
  .admin-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--theme-accent); color: var(--theme-surface);
    font-size: 1.125rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .admin-badge {
    display: inline-block; padding: 2px 10px; border-radius: 50px;
    font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.04em;
    background: color-mix(in srgb, var(--theme-accent) 15%, transparent);
    color: var(--theme-accent); margin-top: 6px;
  }
  .admin-nav {
    flex: 1; display: flex; flex-direction: column; gap: 2px;
    padding: 12px 8px 0;
  }
  .admin-nav a, .admin-nav button.admin-logout {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    font-size: 0.9rem; font-weight: 500;
    color: var(--theme-text-secondary); text-decoration: none;
    transition: background 0.15s, color 0.15s;
    background: none; border: none; cursor: pointer;
    width: 100%; text-align: start;
  }
  .admin-nav a:hover, .admin-nav button.admin-logout:hover {
    background: color-mix(in srgb, var(--theme-accent) 8%, transparent);
    color: var(--theme-text-primary);
  }
  .admin-nav a.active {
    background: color-mix(in srgb, var(--theme-accent) 12%, transparent);
    color: var(--theme-accent); font-weight: 600;
  }
  .admin-logout-wrap {
    padding: 12px 8px; border-top: 1px solid var(--theme-border); margin-top: 8px;
  }
  .admin-main { flex: 1; padding: 32px; min-width: 0; overflow-x: hidden; }
  .admin-mobile-topbar {
    display: none; position: sticky; top: 0; z-index: 40;
    background: var(--theme-surface); border-bottom: 1px solid var(--theme-border);
    padding: 12px 16px; align-items: center; justify-content: space-between;
  }
  .admin-mobile-tabs {
    display: none; overflow-x: auto; gap: 4px;
    padding: 10px 16px; background: var(--theme-surface);
    border-bottom: 1px solid var(--theme-border); scrollbar-width: none;
  }
  .admin-mobile-tabs::-webkit-scrollbar { display: none; }
  .admin-tab {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 8px 10px; border-radius: 10px; font-size: 0.65rem; font-weight: 500;
    color: var(--theme-text-secondary); text-decoration: none;
    white-space: nowrap; transition: background 0.15s, color 0.15s; flex-shrink: 0;
  }
  .admin-tab.active {
    background: color-mix(in srgb, var(--theme-accent) 12%, transparent);
    color: var(--theme-accent); font-weight: 600;
  }
  @media (max-width: 900px) {
    .admin-sidebar { display: none; }
    .admin-mobile-topbar { display: flex; }
    .admin-mobile-tabs { display: flex; }
    .admin-main { padding: 20px 16px; }
  }
`;

export default function AdminLayout({ children }) {
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
      <style>{STYLES}</style>

      {/* Mobile top bar */}
      <div className="admin-mobile-topbar">
        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--theme-text-primary)' }}>
          {t('admin.title')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="admin-avatar" style={{ width: '32px', height: '32px', fontSize: '0.875rem' }}>{initials}</div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--theme-text-secondary)', fontSize: '0.8125rem', fontFamily: 'inherit' }}>
            {t('account.logout')}
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <nav className="admin-mobile-tabs">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.end}
            className={({ isActive }) => 'admin-tab' + (isActive ? ' active' : '')}
          >
            {item.icon}
            {t(`admin.${item.key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="admin-root">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-top-bar">
            <div className="admin-top-title">{t('admin.title')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="admin-avatar">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--theme-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                  {user?.name ?? ''}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--theme-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                  {user?.email ?? ''}
                </div>
              </div>
            </div>
            <div className="admin-badge">{t('admin.badge')}</div>
          </div>

          <nav className="admin-nav">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {item.icon}
                {t(`admin.${item.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="admin-logout-wrap">
            <nav className="admin-nav" style={{ padding: 0 }}>
              <button className="admin-logout" onClick={handleLogout}>
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

        {/* Page content */}
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
