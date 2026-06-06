import './i18n/index.js'
import './styles/rtl.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { ThemeProvider } from './contexts/ThemeContext'
import { queryClient } from './lib/queryClient'
import { useDirection } from './hooks/useDirection'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageWrapper from './components/layout/PageWrapper'
import AuthGuard from './components/routing/AuthGuard'
import GuestGuard from './components/routing/GuestGuard'
import RoleGuard from './components/routing/RoleGuard'

import HomePage from './pages/home/HomePage'
import NotFoundPage from './pages/NotFoundPage'

// Auth pages (real implementations)
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import EmailVerifiedPage from './pages/auth/EmailVerifiedPage'
import SocialCallbackPage from './pages/auth/SocialCallbackPage'

// App pages
import ProductListingPage from './pages/shop/ProductListingPage'
import ProductDetailPage from './pages/shop/ProductDetailPage'
import CartPage from './pages/cart/CartPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import OrderSuccessPage from './pages/checkout/OrderSuccessPage'
import { OrderCancelledPage } from './pages/checkoutPages'
import OrderHistoryPage from './pages/orders/OrderHistoryPage'
import OrderDetailPage from './pages/orders/OrderDetailPage'
import ProfilePage from './pages/account/ProfilePage'
import AddressPage from './pages/account/AddressPage'
import WishlistPage from './pages/account/WishlistPage'
import ChangePasswordPage from './pages/account/ChangePasswordPage'
import { VendorDashboardPage, AdminDashboardPage } from './pages/adminPages'

// Routes that render their own full-screen layout (no navbar/footer)
const AUTH_PATHS = new Set(['/login', '/register', '/forgot-password', '/email-verified', '/auth/callback'])

function AppInner() {
  const { dir } = useDirection()
  const location = useLocation()
  const isAuthRoute = AUTH_PATHS.has(location.pathname)

  return (
    <div
      dir={dir}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--theme-bg)',
        color: 'var(--theme-text-primary)',
        transition: 'background-color 0.4s ease, color 0.4s ease',
      }}
    >
      {!isAuthRoute && <Navbar />}

      <PageWrapper>
        <Routes>
          {/* Auth routes — use AuthLayout internally, no shared chrome */}
          <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
          <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />
          <Route path="/email-verified" element={<EmailVerifiedPage />} />
          <Route path="/auth/callback" element={<SocialCallbackPage />} />

          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ProductListingPage />} />
          <Route path="/shop/:categorySlug" element={<ProductListingPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />

          {/* Cart — guests can view; auth required only for checkout */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
          <Route path="/checkout/success" element={<AuthGuard><OrderSuccessPage /></AuthGuard>} />
          <Route path="/checkout/cancelled" element={<AuthGuard><OrderCancelledPage /></AuthGuard>} />
          <Route path="/orders" element={<AuthGuard><OrderHistoryPage /></AuthGuard>} />
          <Route path="/orders/:id" element={<AuthGuard><OrderDetailPage /></AuthGuard>} />
          <Route path="/account" element={<AuthGuard><ProfilePage /></AuthGuard>} />
          <Route path="/account/addresses" element={<AuthGuard><AddressPage /></AuthGuard>} />
          <Route path="/account/wishlist" element={<AuthGuard><WishlistPage /></AuthGuard>} />
          <Route path="/account/password" element={<AuthGuard><ChangePasswordPage /></AuthGuard>} />

          {/* Role-gated */}
          <Route path="/vendor/dashboard" element={<RoleGuard role="vendor"><VendorDashboardPage /></RoleGuard>} />
          <Route path="/admin/dashboard" element={<RoleGuard role="admin"><AdminDashboardPage /></RoleGuard>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageWrapper>

      {!isAuthRoute && <Footer />}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--theme-surface)',
            color: 'var(--theme-text-primary)',
            border: '1px solid var(--theme-border)',
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
