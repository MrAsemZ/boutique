import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrashIcon,
  ShoppingBagIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../stores/authStore';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/api/useCart';
import { useValidateVoucher } from '../../hooks/api/useCheckout';
import { formatPrice } from '../../utils/formatPrice';
import { getGuestCart } from '../../utils/guestCart';

const SHIPPING_FEE = 15.0;

const FASHION_PLACEHOLDER =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=160&q=80';

function normalizeItem(item, isGuest, lang) {
  if (isGuest) {
    return {
      key: String(item.variantId),
      id: item.variantId,
      variantId: item.variantId,
      name: lang === 'ar' ? (item.productNameAr || item.productName) : item.productName,
      image: item.imageUrl,
      size: item.size,
      color: item.color,
      price: item.price,
      lineTotal: item.price * item.quantity,
      quantity: item.quantity,
      stock: item.stock ?? 99,
    };
  }
  return {
    key: String(item.id),
    id: item.id,
    variantId: item.variant?.id,
    name:
      lang === 'ar'
        ? item.product?.name_ar || item.product?.name
        : item.product?.name,
    image: item.product?.primary_image_url,
    size: item.variant?.size,
    color: item.variant?.color,
    price: item.unit_price,
    lineTotal: item.line_total,
    quantity: item.quantity,
    stock: item.variant?.stock ?? 99,
  };
}

const CART_STYLES = `
  .cart-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  @media (min-width: 768px) {
    .cart-layout {
      flex-direction: row;
      align-items: flex-start;
    }
    .cart-items-col { flex: 1; min-width: 0; }
    .cart-summary-col { width: 320px; flex-shrink: 0; }
    .cart-summary-sticky { position: sticky; top: 90px; }
  }
  .cart-item-row {
    display: flex;
    gap: 16px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 10px;
  }
  .cart-item-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    background: var(--theme-border);
    flex-shrink: 0;
  }
  .qty-stepper {
    display: inline-flex;
    align-items: center;
    border: 1.5px solid var(--theme-border);
    border-radius: 50px;
    overflow: hidden;
  }
  .qty-btn {
    background: none;
    border: none;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--theme-accent);
    transition: background 0.15s;
  }
  .qty-btn:hover:not(:disabled) { background: var(--theme-border); }
  .qty-btn:disabled { opacity: 0.35; cursor: default; }
  .qty-num {
    min-width: 32px;
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--theme-text-primary);
    padding: 0 4px;
    border-inline: 1px solid var(--theme-border);
  }
  .summary-card {
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    border-radius: 12px;
    padding: 20px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 0.9rem;
    color: var(--theme-text-secondary);
  }
  .summary-row.total {
    font-size: 1rem;
    font-weight: 700;
    color: var(--theme-text-primary);
    border-top: 1px solid var(--theme-border);
    margin-top: 8px;
    padding-top: 12px;
  }
  .voucher-input {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }
  .voucher-input input {
    flex: 1;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid var(--theme-border);
    background: var(--theme-bg);
    color: var(--theme-text-primary);
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }
  .voucher-input input:focus { border-color: var(--theme-accent); }
  .guest-notice {
    background: color-mix(in srgb, var(--theme-accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: block;
    width: 100%;
    padding: 14px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    background: var(--theme-accent);
    color: var(--theme-surface);
    text-decoration: none;
    transition: opacity 0.2s;
    margin-top: 16px;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-primary:disabled { opacity: 0.5; cursor: default; }
  .btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 50px;
    border: 1.5px solid var(--theme-border);
    background: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--theme-text-secondary);
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-outline:hover { border-color: var(--theme-accent); color: var(--theme-accent); }
`;

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const lang = i18n.language;
  const isRTL = lang === 'ar';

  const { items: serverItems, isLoading, isGuest } = useCart();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: validateVoucher, isPending: isValidating } = useValidateVoucher();

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  const ArrowIcon = isRTL ? ArrowLongLeftIcon : ArrowLongRightIcon;

  const rawItems = isGuest ? getGuestCart().items : (serverItems ?? []);
  const items = rawItems.map((item) => normalizeItem(item, isGuest, lang));

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const isFreeShipping = appliedVoucher?.voucher_type === 'free_shipping';
  const shipping = isFreeShipping ? 0 : SHIPPING_FEE;
  const discount = appliedVoucher?.discount_amount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleQtyChange = (item, delta) => {
    const next = item.quantity + delta;
    if (next < 1 || next > item.stock) return;
    updateItem({ id: item.id, variantId: item.variantId, quantity: next });
  };

  const handleRemove = (item) => {
    removeItem({ id: item.id, variantId: item.variantId });
  };

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return;
    setVoucherError('');
    validateVoucher(
      { code: voucherCode.trim(), cart_total: subtotal },
      {
        onSuccess: (data) => {
          setAppliedVoucher(data?.data ?? data);
          toast.success(t('cart.voucher_applied'));
        },
        onError: (err) => {
          setVoucherError(err?.response?.data?.message || t('common.error'));
          setAppliedVoucher(null);
        },
      }
    );
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    const query = appliedVoucher?.code ? `?voucher=${appliedVoucher.code}` : '';
    navigate(`/checkout${query}`);
  };

  const isMutating = isUpdating || isRemoving;

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--theme-text-secondary)' }}>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--theme-bg)', minHeight: '100vh', padding: '24px 16px' }}>
      <style>{CART_STYLES}</style>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <Link to="/shop" className="btn-outline" style={{ marginBottom: '12px' }}>
            <ArrowLongLeftIcon style={{ width: '16px', height: '16px', transform: isRTL ? 'none' : 'rotate(180deg)' }} />
            {t('cart.back_to_shop')}
          </Link>
          <h1 style={{ margin: '12px 0 4px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
            {t('cart.title')}
          </h1>
          {items.length > 0 && (
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--theme-text-hint, var(--theme-text-secondary))' }}>
              {t('cart.items_count', { count: items.length })}
            </p>
          )}
        </div>

        {/* Guest notice */}
        {!isAuthenticated && items.length > 0 && (
          <div className="guest-notice">
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--theme-text-primary)' }}>
              {t('cart.login_notice')}
            </p>
            <Link
              to="/login"
              state={{ from: '/checkout' }}
              style={{
                padding: '8px 18px', borderRadius: '50px',
                background: 'var(--theme-accent)', color: 'var(--theme-surface)',
                fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {t('nav.login')}
            </Link>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <ShoppingBagIcon style={{ width: '72px', height: '72px', color: 'var(--theme-border)', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '8px' }}>
              {t('cart.empty')}
            </h2>
            <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '24px' }}>
              {t('cart.empty_sub')}
            </p>
            <Link
              to="/shop"
              style={{
                display: 'inline-block', padding: '12px 32px', borderRadius: '50px',
                background: 'var(--theme-accent)', color: 'var(--theme-surface)',
                fontWeight: 600, textDecoration: 'none',
              }}
            >
              {t('cart.back_to_shop')}
            </Link>
          </div>
        ) : (
          <div className="cart-layout">

            {/* Items column */}
            <div className="cart-items-col">
              {items.map((item) => (
                <div key={item.key} className="cart-item-row" style={{ opacity: isMutating ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                  <img
                    src={item.image || FASHION_PLACEHOLDER}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => { e.currentTarget.src = FASHION_PLACEHOLDER; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--theme-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ margin: '0 0 10px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
                      {item.size && `${t('product.size')}: ${item.size}`}
                      {item.size && item.color && ' | '}
                      {item.color && `${t('product.color')}: ${item.color}`}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div className="qty-stepper">
                        <button
                          className="qty-btn"
                          onClick={() => handleQtyChange(item, -1)}
                          disabled={isMutating || item.quantity <= 1}
                          aria-label="Decrease"
                        >−</button>
                        <span className="qty-num">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleQtyChange(item, 1)}
                          disabled={isMutating || item.quantity >= item.stock}
                          aria-label="Increase"
                        >+</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
                          {formatPrice(item.lineTotal, lang)}
                        </span>
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={isMutating}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--theme-text-secondary)', display: 'flex', borderRadius: '6px', transition: 'color 0.15s' }}
                          aria-label={t('cart.remove')}
                          title={t('cart.remove')}
                        >
                          <TrashIcon style={{ width: '18px', height: '18px' }} />
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)' }}>
                      {formatPrice(item.price, lang)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary column */}
            <div className="cart-summary-col">
              <div className="summary-card cart-summary-sticky">
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
                  {t('checkout.order_summary')}
                </h3>

                <div className="summary-row">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatPrice(subtotal, lang)}</span>
                </div>
                <div className="summary-row">
                  <span>{t('cart.shipping')}</span>
                  <span style={{ color: isFreeShipping ? 'var(--theme-success, #22c55e)' : undefined }}>
                    {isFreeShipping ? t('cart.free') : formatPrice(shipping, lang)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="summary-row" style={{ color: 'var(--theme-success, #22c55e)' }}>
                    <span>{t('cart.discount')}</span>
                    <span>− {formatPrice(discount, lang)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>{t('cart.order_total')}</span>
                  <span style={{ color: 'var(--theme-accent)' }}>{formatPrice(total, lang)}</span>
                </div>

                {/* Voucher */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--theme-border)' }}>
                  {appliedVoucher ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: '10px',
                      background: 'color-mix(in srgb, var(--theme-success, #22c55e) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--theme-success, #22c55e) 30%, transparent)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleSolid style={{ width: '18px', height: '18px', color: 'var(--theme-success, #22c55e)' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)' }}>
                          {appliedVoucher.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--theme-text-secondary)', display: 'flex' }}
                        title={t('cart.voucher_remove')}
                      >
                        <XMarkIcon style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--theme-text-secondary)', display: 'block', marginBottom: '6px' }}>
                        {t('cart.voucher')}
                      </label>
                      <div className="voucher-input">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(''); }}
                          placeholder="WELCOME20"
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                        />
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isValidating || !voucherCode.trim()}
                          style={{
                            padding: '0 16px', borderRadius: '10px', border: 'none',
                            background: 'var(--theme-accent)', color: 'var(--theme-surface)',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                            opacity: (isValidating || !voucherCode.trim()) ? 0.5 : 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isValidating ? '...' : t('cart.apply')}
                        </button>
                      </div>
                      {voucherError && (
                        <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: 'var(--theme-badge-sale, #ef4444)' }}>
                          {voucherError}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Checkout CTA */}
                {isAuthenticated ? (
                  <button className="btn-primary" onClick={handleCheckout}>
                    {t('cart.proceed_to_checkout')}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={handleCheckout}>
                    {t('cart.login_to_checkout')}
                  </button>
                )}

                <Link
                  to="/shop"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    marginTop: '12px', fontSize: '0.875rem', color: 'var(--theme-text-secondary)',
                    textDecoration: 'none', padding: '8px',
                  }}
                >
                  <ArrowIcon style={{ width: '14px', height: '14px' }} />
                  {t('cart.back_to_shop')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
