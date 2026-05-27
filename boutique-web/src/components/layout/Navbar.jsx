import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCartIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useDirection } from '../../hooks/useDirection';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import LanguageSwitcher from '../common/LanguageSwitcher';

function CountBadge({ count }) {
  if (!count || count < 1) return null;
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '-5px',
        insetInlineEnd: '-5px',
        minWidth: '16px',
        height: '16px',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.6rem',
        fontWeight: 700,
        color: '#fff',
        background: 'var(--theme-accent)',
        padding: '0 3px',
        lineHeight: 1,
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const { isAuthenticated, logout } = useAuthStore();
  const { itemCount: cartCount } = useCartStore();
  const { itemCount: wishlistCount } = useWishlistStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    ...(isAuthenticated ? [{ to: '/orders', label: t('nav.orders') }] : []),
  ];

  const iconStyle = { color: 'var(--theme-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'var(--theme-surface)',
        borderBottom: '1px solid var(--theme-border)',
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            style={{ color: 'var(--theme-text-primary)', fontWeight: 700, fontSize: '1.25rem', textDecoration: 'none' }}
          >
            Boutique
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  color: location.pathname === to ? 'var(--theme-accent)' : 'var(--theme-text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.9375rem',
                  transition: 'color 0.2s',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop action icons */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />

            <button style={iconStyle} aria-label={t('common.search')}>
              <MagnifyingGlassIcon style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Wishlist */}
            <Link
              to={isAuthenticated ? '/account/wishlist' : '/login'}
              className="relative"
              style={{ color: 'var(--theme-text-secondary)', display: 'flex' }}
            >
              <HeartIcon style={{ width: '20px', height: '20px' }} />
              <CountBadge count={wishlistCount} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative"
              style={{ color: 'var(--theme-text-secondary)', display: 'flex' }}
            >
              <ShoppingCartIcon style={{ width: '20px', height: '20px' }} />
              <CountBadge count={cartCount} />
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  style={iconStyle}
                  aria-label={t('nav.account')}
                >
                  <UserCircleIcon style={{ width: '24px', height: '24px', color: 'var(--theme-text-secondary)' }} />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div
                      className="absolute z-20 mt-2 w-44 rounded-lg py-1 shadow-lg"
                      style={{
                        insetInlineEnd: 0,
                        top: '100%',
                        background: 'var(--theme-surface)',
                        border: '1px solid var(--theme-border)',
                      }}
                    >
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm"
                        style={{ color: 'var(--theme-text-primary)', textDecoration: 'none' }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t('nav.account')}
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="block w-full px-4 py-2 text-sm"
                        style={{
                          color: 'var(--theme-text-primary)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'start',
                        }}
                      >
                        {t('nav.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                style={{ color: 'var(--theme-accent)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem' }}
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            style={{ ...iconStyle, color: 'var(--theme-text-primary)' }}
            aria-label="Menu"
          >
            {mobileOpen
              ? <XMarkIcon style={{ width: '24px', height: '24px' }} />
              : <Bars3Icon style={{ width: '24px', height: '24px' }} />
            }
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden py-4 flex flex-col gap-3"
            style={{ borderTop: '1px solid var(--theme-border)' }}
          >
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="py-1"
                style={{
                  color: location.pathname === to ? 'var(--theme-accent)' : 'var(--theme-text-primary)',
                  textDecoration: 'none',
                  fontSize: '1rem',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}

            <div className="flex items-center gap-4 pt-2">
              <Link
                to="/cart"
                className="relative"
                style={{ color: 'var(--theme-text-secondary)', display: 'flex' }}
                onClick={() => setMobileOpen(false)}
              >
                <ShoppingCartIcon style={{ width: '20px', height: '20px' }} />
                <CountBadge count={cartCount} />
              </Link>
              <LanguageSwitcher />
            </div>

            {!isAuthenticated && (
              <Link
                to="/login"
                style={{ color: 'var(--theme-accent)', textDecoration: 'none', fontWeight: 500 }}
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
