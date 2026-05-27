import './i18n/index.js'
import './styles/rtl.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/authPages'
import { ProductListingPage, ProductDetailPage } from './pages/shopPages'
import { CartPage, CheckoutPage, OrderSuccessPage, OrderCancelledPage } from './pages/checkoutPages'
import { OrderHistoryPage, OrderDetailPage } from './pages/orderPages'
import { ProfilePage, AddressPage, WishlistPage } from './pages/accountPages'
import { VendorDashboardPage, AdminDashboardPage } from './pages/adminPages'

function AppInner() {
  const { dir } = useDirection()

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
      <Navbar />

      <PageWrapper>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ProductListingPage />} />
          <Route path="/shop/:categorySlug" element={<ProductListingPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />

          {/* Auth required */}
          <Route path="/cart" element={<AuthGuard><CartPage /></AuthGuard>} />
          <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
          <Route path="/checkout/success" element={<AuthGuard><OrderSuccessPage /></AuthGuard>} />
          <Route path="/checkout/cancelled" element={<AuthGuard><OrderCancelledPage /></AuthGuard>} />
          <Route path="/orders" element={<AuthGuard><OrderHistoryPage /></AuthGuard>} />
          <Route path="/orders/:id" element={<AuthGuard><OrderDetailPage /></AuthGuard>} />
          <Route path="/account" element={<AuthGuard><ProfilePage /></AuthGuard>} />
          <Route path="/account/addresses" element={<AuthGuard><AddressPage /></AuthGuard>} />
          <Route path="/account/wishlist" element={<AuthGuard><WishlistPage /></AuthGuard>} />

          {/* Guest only */}
          <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
          <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />

          {/* Role-gated */}
          <Route path="/vendor/dashboard" element={<RoleGuard role="vendor"><VendorDashboardPage /></RoleGuard>} />
          <Route path="/admin/dashboard" element={<RoleGuard role="admin"><AdminDashboardPage /></RoleGuard>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageWrapper>

      <Footer />

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
