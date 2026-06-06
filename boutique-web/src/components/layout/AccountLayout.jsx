import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/api/useAuth';

const ACCOUNT_STYLES = `
  .acct-shell {
    display: flex;
    min-height: calc(100vh - 64px);
    background: var(--theme-bg);
  }
  .acct-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--theme-surface);
    border-inline-end: 1px solid var(--theme-border);
    display: flex;
    flex-direction: column;
    padding: 28px 0 20px;
    position: sticky;
    top: 64px;
    height: calc(100vh - 64px);
    overflow-y: auto;
  }
  .acct-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--theme-accent);
    color: var(--theme-surface);
    font-size: 1.375rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    flex-shrink: 0;
  }
  .acct-user-name {
    font-weight: 600;
    font-size: 0.9375rem;
    color: var(--theme-text-primary);
    text-align: center;
    padding: 0 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .acct-user-email {
    font-size: 0.75rem;
    color: var(--theme-text-secondary);
    text-align: center;
    padding: 0 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }
  .acct-nav {
    margin-top: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 8px;
  }
  .acct-nav a, .acct-nav button.acct-logout {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--theme-text-secondary);
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: start;
  }
  .acct-nav a:hover, .acct-nav button.acct-logout:hover {
    background: color-mix(in srgb, var(--theme-accent) 8%, transparent);
    color: var(--theme-text-primary);
  }
  .acct-nav a.active {
    background: color-mix(in srgb, var(--theme-accent) 12%, transparent);
    color: var(--theme-accent);
    font-weight: 600;
  }
  .acct-logout-wrap {
    padding: 12px 8px 0;
    border-top: 1px solid var(--theme-border);
    margin: 8px 0 0;
  }
  .acct-main {
    flex: 1;
    padding: 32px;
    min-width: 0;
  }
  /* Mobile tabs */
  .acct-mobile-tabs {
    display: none;
    overflow-x: auto;
    gap: 4px;
    padding: 10px 16px;
    background: var(--theme-surface);
    border-bottom: 1px solid var(--theme-border);
    scrollbar-width: none;
  }
  .acct-mobile-tabs::-webkit-scrollbar { display: none; }
  .acct-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--theme-text-secondary);
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .acct-tab.active {
    background: color-mix(in srgb, var(--theme-accent) 12%, transparent);
    color: var(--theme-accent);
    font-weight: 600;
  }
  .acct-tab svg { flex-shrink: 0; }
  @media (max-width: 768px) {
    .acct-sidebar { display: none; }
    .acct-mobile-tabs { display: flex; }
    .acct-main { padding: 20px 16px; }
  }
`;

const NAV_ITEMS = [
  {
    key: 'orders',
    path: '/orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    key: 'wishlist',
    path: '/account/wishlist',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    key: 'profile',
    path: '/account',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    key: 'addresses',
    path: '/account/addresses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    key: 'password',
    path: '/account/password',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
];

export default function AccountLayout({ children }) {
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
      <style>{ACCOUNT_STYLES}</style>

      {/* Mobile tabs */}
      <nav className="acct-mobile-tabs">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.key} to={item.path} end={item.end} className={({ isActive }) => 'acct-tab' + (isActive ? ' active' : '')}>
            {item.icon}
            {t(`account.${item.key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="acct-shell">
        {/* Sidebar */}
        <aside className="acct-sidebar">
          <div className="acct-avatar">{initials}</div>
          <div className="acct-user-name">{user?.name ?? ''}</div>
          <div className="acct-user-email">{user?.email ?? ''}</div>

          <nav className="acct-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {item.icon}
                {t(`account.${item.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="acct-logout-wrap">
            <nav className="acct-nav" style={{ margin: 0 }}>
              <button className="acct-logout" onClick={handleLogout}>
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
        <main className="acct-main">{children}</main>
      </div>
    </>
  );
}
