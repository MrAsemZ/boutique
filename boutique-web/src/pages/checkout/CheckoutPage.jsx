import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPinIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  PlusIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

import { useCart } from '../../hooks/api/useCart';
import { useAddresses, useCreateAddress } from '../../hooks/api/useAddresses';
import { useCheckout, useCliqSimulate, useCancelOrder } from '../../hooks/api/useCheckout';
import { formatPrice } from '../../utils/formatPrice';

const SHIPPING_FEE = 15.0;

const CHECKOUT_STYLES = `
  .co-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  @media (min-width: 768px) {
    .co-layout { flex-direction: row; align-items: flex-start; }
    .co-main { flex: 1; min-width: 0; }
    .co-aside { width: 300px; flex-shrink: 0; position: sticky; top: 90px; }
  }
  .co-card {
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }
  .co-card-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--theme-text-primary);
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .addr-card {
    border: 2px solid var(--theme-border);
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
  }
  .addr-card.selected {
    border-color: var(--theme-accent);
    background: color-mix(in srgb, var(--theme-accent) 6%, transparent);
  }
  .pay-card {
    border: 2px solid var(--theme-border);
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .pay-card.selected {
    border-color: var(--theme-accent);
    background: color-mix(in srgb, var(--theme-accent) 6%, transparent);
  }
  .pay-radio {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--theme-border);
    margin-top: 2px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s;
  }
  .pay-radio.checked {
    border-color: var(--theme-accent);
    background: var(--theme-accent);
  }
  .pay-radio.checked::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--theme-surface);
  }
  .co-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }
  .co-field label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--theme-text-secondary);
  }
  .co-field input, .co-field select, .co-field textarea {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid var(--theme-border);
    background: var(--theme-bg);
    color: var(--theme-text-primary);
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .co-field input:focus, .co-field select:focus, .co-field textarea:focus {
    border-color: var(--theme-accent);
  }
  .progress-bar {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    gap: 0;
  }
  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
    position: relative;
  }
  .progress-step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 14px;
    inset-inline-start: 50%;
    width: 100%;
    height: 2px;
    background: var(--theme-border);
    z-index: 0;
  }
  .progress-step.done:not(:last-child)::after,
  .progress-step.active:not(:last-child)::after {
    background: var(--theme-accent);
  }
  .progress-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--theme-border);
    background: var(--theme-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--theme-text-secondary);
    z-index: 1;
    position: relative;
    transition: all 0.2s;
  }
  .progress-dot.active {
    border-color: var(--theme-accent);
    background: var(--theme-accent);
    color: var(--theme-surface);
  }
  .progress-dot.done {
    border-color: var(--theme-accent);
    background: var(--theme-accent);
    color: var(--theme-surface);
  }
  .progress-label {
    font-size: 0.75rem;
    color: var(--theme-text-secondary);
    white-space: nowrap;
  }
  .progress-label.active { color: var(--theme-accent); font-weight: 600; }
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 0.875rem;
    color: var(--theme-text-secondary);
  }
  .summary-row.total {
    font-weight: 700;
    font-size: 1rem;
    color: var(--theme-text-primary);
    border-top: 1px solid var(--theme-border);
    margin-top: 8px;
    padding-top: 10px;
  }
  .btn-row {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  .btn-back {
    padding: 12px 20px;
    border-radius: 50px;
    border: 1.5px solid var(--theme-border);
    background: none;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--theme-text-secondary);
    transition: border-color 0.2s;
  }
  .btn-back:hover { border-color: var(--theme-accent); color: var(--theme-accent); }
  .btn-next {
    flex: 1;
    padding: 12px 24px;
    border-radius: 50px;
    border: none;
    background: var(--theme-accent);
    color: var(--theme-surface);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .btn-next:hover { opacity: 0.88; }
  .btn-next:disabled { opacity: 0.45; cursor: default; }
  .cliq-screen {
    text-align: center;
    padding: 40px 24px;
  }
  @keyframes pulse-phone {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.08); }
  }
  .cliq-icon {
    animation: pulse-phone 1.8s ease-in-out infinite;
    display: inline-block;
    font-size: 4rem;
    margin-bottom: 16px;
  }
`;

function normalizeServerItem(item, lang) {
  return {
    id: item.id,
    name: lang === 'ar' ? (item.product?.name_ar || item.product?.name) : item.product?.name,
    image: item.product?.primary_image_url,
    size: item.variant?.size,
    color: item.variant?.color,
    price: item.unit_price,
    lineTotal: item.line_total,
    quantity: item.quantity,
  };
}

function ProgressBar({ step, t }) {
  const steps = [
    { key: 1, label: t('checkout.step_address') },
    { key: 2, label: t('checkout.step_payment') },
    { key: 3, label: t('checkout.step_confirm') },
  ];
  return (
    <div className="progress-bar">
      {steps.map((s) => {
        const state = s.key < step ? 'done' : s.key === step ? 'active' : '';
        return (
          <div key={s.key} className={`progress-step ${state}`}>
            <div className={`progress-dot ${state}`}>
              {s.key < step ? '✓' : s.key}
            </div>
            <span className={`progress-label ${state}`}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function AddressForm({ t, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    label: '', full_name: '', phone: '',
    address_line1: '', address_line2: '', city: '', country: 'Jordan',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.label || !form.full_name || !form.phone || !form.address_line1 || !form.city || !form.country) {
      toast.error('Please fill all required fields');
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '16px', padding: '16px', background: 'var(--theme-bg)', borderRadius: '10px', border: '1px solid var(--theme-border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <div className="co-field">
          <label>{t('checkout.addr_label')} *</label>
          <input value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="Home / Work" required />
        </div>
        <div className="co-field">
          <label>{t('checkout.addr_name')} *</label>
          <input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
        </div>
        <div className="co-field">
          <label>{t('checkout.addr_phone')} *</label>
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} type="tel" required />
        </div>
        <div className="co-field">
          <label>{t('checkout.addr_city')} *</label>
          <input value={form.city} onChange={(e) => set('city', e.target.value)} required />
        </div>
        <div className="co-field" style={{ gridColumn: '1 / -1' }}>
          <label>{t('checkout.addr_line1')} *</label>
          <input value={form.address_line1} onChange={(e) => set('address_line1', e.target.value)} required />
        </div>
        <div className="co-field" style={{ gridColumn: '1 / -1' }}>
          <label>{t('checkout.addr_line2')}</label>
          <input value={form.address_line2} onChange={(e) => set('address_line2', e.target.value)} />
        </div>
        <div className="co-field">
          <label>{t('checkout.addr_country')} *</label>
          <input value={form.country} onChange={(e) => set('country', e.target.value)} required />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button type="button" className="btn-back" onClick={onCancel}>{t('common.cancel')}</button>
        <button type="submit" className="btn-next" disabled={isSaving}>
          {isSaving ? '...' : t('checkout.save_address')}
        </button>
      </div>
    </form>
  );
}

function OrderSummaryAside({ items, subtotal, shipping, discount, voucherCode, lang, t }) {
  const total = Math.max(0, subtotal + shipping - discount);
  const isFreeShipping = shipping === 0;
  return (
    <div className="co-card">
      <h3 className="co-card-title">
        <ClipboardDocumentListIcon style={{ width: '18px', height: '18px' }} />
        {t('checkout.order_summary')}
      </h3>
      <div style={{ marginBottom: '12px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: 'var(--theme-border)', overflow: 'hidden', flexShrink: 0 }}>
              {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--theme-text-secondary)' }}>
                {item.size && `${item.size}`}{item.size && item.color && ' / '}{item.color && item.color} × {item.quantity}
              </p>
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', flexShrink: 0 }}>
              {formatPrice(item.lineTotal, lang)}
            </span>
          </div>
        ))}
      </div>
      <div className="summary-row"><span>{t('cart.subtotal')}</span><span>{formatPrice(subtotal, lang)}</span></div>
      <div className="summary-row">
        <span>{t('cart.shipping')}</span>
        <span style={{ color: isFreeShipping ? 'var(--theme-success, #22c55e)' : undefined }}>
          {isFreeShipping ? t('cart.free') : formatPrice(shipping, lang)}
        </span>
      </div>
      {discount > 0 && (
        <div className="summary-row" style={{ color: 'var(--theme-success, #22c55e)' }}>
          <span>{t('cart.discount')} {voucherCode && `(${voucherCode})`}</span>
          <span>− {formatPrice(discount, lang)}</span>
        </div>
      )}
      <div className="summary-row total">
        <span>{t('cart.order_total')}</span>
        <span style={{ color: 'var(--theme-accent)' }}>{formatPrice(total, lang)}</span>
      </div>
    </div>
  );
}

function CliQWaitingScreen({ cliqRequestId, orderId, orderNumber, t, lang }) {
  const [seconds, setSeconds] = useState(15 * 60);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { mutate: simulate, isPending: isSimulating } = useCliqSimulate();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [done]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const handlePaid = () => {
    simulate(cliqRequestId, {
      onSuccess: () => {
        setDone(true);
        navigate(`/checkout/success?order=${orderNumber}&id=${orderId}`);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || t('common.error'));
      },
    });
  };

  const handleCancel = () => {
    cancelOrder(orderId, {
      onSuccess: () => navigate('/'),
      onError: () => navigate('/'),
    });
  };

  return (
    <div className="cliq-screen">
      <div className="cliq-icon">📱</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '8px' }}>
        {t('checkout.waiting_payment')}
      </h2>
      <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>{t('checkout.payment_request_sent')}</p>
      <p style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)', marginBottom: '24px' }}>
        {t('orders.order_number')}: <strong style={{ color: 'var(--theme-text-primary)' }}>{orderNumber}</strong>
      </p>
      {!done && seconds > 0 && (
        <div style={{
          display: 'inline-block', padding: '12px 24px', borderRadius: '12px',
          background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
          fontVariantNumeric: 'tabular-nums', fontSize: '1.5rem', fontWeight: 700,
          color: seconds < 60 ? 'var(--theme-badge-sale, #ef4444)' : 'var(--theme-text-primary)',
          marginBottom: '24px',
        }}>
          {mm}:{ss}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
        <button
          onClick={handlePaid}
          disabled={isSimulating || done}
          style={{
            padding: '14px', borderRadius: '50px', border: 'none',
            background: 'var(--theme-accent)', color: 'var(--theme-surface)',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            opacity: isSimulating ? 0.6 : 1,
          }}
        >
          {isSimulating ? '...' : t('checkout.ive_paid')}
        </button>
        <button
          onClick={handleCancel}
          disabled={isCancelling}
          style={{
            padding: '12px', borderRadius: '50px',
            border: '1.5px solid var(--theme-border)', background: 'none',
            fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer',
            color: 'var(--theme-text-secondary)',
          }}
        >
          {t('checkout.cancel')}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lang = i18n.language;

  const voucherFromCart = searchParams.get('voucher') || '';

  const { items: serverItems, subtotal: cartSubtotal, isLoading: cartLoading } = useCart();
  const { data: addressData, isLoading: addrLoading } = useAddresses();
  const { mutate: checkout, isPending: isPlacing } = useCheckout();
  const { mutate: createAddress, isPending: isSavingAddr } = useCreateAddress();

  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [cliqData, setCliqData] = useState(null);

  const addresses = addressData?.data ?? [];
  const items = (serverItems ?? []).map((item) => normalizeServerItem(item, lang));

  const subtotal = cartSubtotal || items.reduce((s, i) => s + i.lineTotal, 0);
  const isFreeShipping = voucherFromCart && voucherFromCart !== '';
  const shipping = SHIPPING_FEE;
  const discount = 0;

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  const handleSaveAddress = (formData) => {
    createAddress(formData, {
      onSuccess: (res) => {
        const saved = res?.data;
        if (saved?.id) setSelectedAddressId(saved.id);
        setShowAddressForm(false);
        toast.success(t('checkout.save_address'));
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || t('common.error'));
      },
    });
  };

  const handlePlaceOrder = () => {
    const payload = {
      address_id: selectedAddressId,
      payment_method: paymentMethod,
      notes: notes || undefined,
    };
    if (voucherFromCart) payload.voucher_code = voucherFromCart;

    checkout(payload, {
      onSuccess: (res) => {
        const data = res?.data ?? res;
        if (paymentMethod === 'cliq' && data?.cliq_request_id) {
          setCliqData(data);
        } else {
          navigate(`/checkout/success?order=${data.order_number}&id=${data.order_id}`);
        }
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || t('common.error'));
      },
    });
  };

  if (cartLoading || addrLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--theme-text-secondary)' }}>{t('common.loading')}</p>
      </div>
    );
  }

  if (cliqData) {
    return (
      <div style={{ background: 'var(--theme-bg)', minHeight: '100vh', padding: '24px 16px' }}>
        <style>{CHECKOUT_STYLES}</style>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="co-card">
            <CliQWaitingScreen
              cliqRequestId={cliqData.cliq_request_id}
              orderId={cliqData.order_id}
              orderNumber={cliqData.order_number}
              t={t}
              lang={lang}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--theme-bg)', minHeight: '100vh', padding: '24px 16px' }}>
      <style>{CHECKOUT_STYLES}</style>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '20px' }}>
          {t('checkout.title')}
        </h1>

        <ProgressBar step={step} t={t} />

        <div className="co-layout">
          <div className="co-main">

            {/* ── Step 1: Address ── */}
            {step === 1 && (
              <div className="co-card">
                <h2 className="co-card-title">
                  <MapPinIcon style={{ width: '18px', height: '18px', color: 'var(--theme-accent)' }} />
                  {t('checkout.step_address')}
                </h2>

                {addresses.length === 0 && !showAddressForm && (
                  <p style={{ color: 'var(--theme-text-secondary)', marginBottom: '12px' }}>
                    {t('checkout.no_addresses')}
                  </p>
                )}

                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`addr-card${selectedAddressId === addr.id ? ' selected' : ''}`}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    {selectedAddressId === addr.id && (
                      <CheckCircleSolid style={{ width: '18px', height: '18px', color: 'var(--theme-accent)', position: 'absolute', top: '12px', insetInlineEnd: '12px' }} />
                    )}
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--theme-text-primary)' }}>
                      {addr.label} — {addr.full_name}
                    </p>
                    <p style={{ margin: '0 0 2px', fontSize: '0.85rem', color: 'var(--theme-text-secondary)' }}>
                      {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-text-secondary)' }}>
                      {addr.city}, {addr.country} — {addr.phone}
                    </p>
                    {addr.is_default && (
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: 'var(--theme-accent)', fontWeight: 600 }}>
                        ★ Default
                      </span>
                    )}
                  </div>
                ))}

                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '10px 16px', borderRadius: '10px',
                      border: '1.5px dashed var(--theme-border)', background: 'none',
                      cursor: 'pointer', color: 'var(--theme-accent)', fontWeight: 500, fontSize: '0.875rem',
                      width: '100%', justifyContent: 'center', marginTop: '4px',
                    }}
                  >
                    <PlusIcon style={{ width: '16px', height: '16px' }} />
                    {t('checkout.add_address')}
                  </button>
                ) : (
                  <AddressForm
                    t={t}
                    onSave={handleSaveAddress}
                    onCancel={() => setShowAddressForm(false)}
                    isSaving={isSavingAddr}
                  />
                )}

                <div className="btn-row">
                  <button
                    className="btn-next"
                    onClick={() => setStep(2)}
                    disabled={!selectedAddressId}
                  >
                    {t('checkout.next')}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Payment ── */}
            {step === 2 && (
              <div className="co-card">
                <h2 className="co-card-title">
                  <CreditCardIcon style={{ width: '18px', height: '18px', color: 'var(--theme-accent)' }} />
                  {t('checkout.step_payment')}
                </h2>

                <div
                  className={`pay-card${paymentMethod === 'cod' ? ' selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className={`pay-radio${paymentMethod === 'cod' ? ' checked' : ''}`} />
                  <div>
                    <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--theme-text-primary)' }}>
                      💵 {t('checkout.cod')}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-text-secondary)' }}>
                      {t('checkout.cod_subtitle')}
                    </p>
                  </div>
                </div>

                <div
                  className={`pay-card${paymentMethod === 'cliq' ? ' selected' : ''}`}
                  onClick={() => setPaymentMethod('cliq')}
                >
                  <div className={`pay-radio${paymentMethod === 'cliq' ? ' checked' : ''}`} />
                  <div>
                    <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--theme-text-primary)' }}>
                      <PhoneIcon style={{ width: '16px', height: '16px', display: 'inline', marginInlineEnd: '6px', verticalAlign: 'middle' }} />
                      {t('checkout.cliq')}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--theme-text-secondary)' }}>
                      {t('checkout.cliq_subtitle')}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--theme-text-secondary)', fontStyle: 'italic' }}>
                      {t('checkout.cliq_note')}
                    </p>
                  </div>
                </div>

                <div className="btn-row">
                  <button className="btn-back" onClick={() => setStep(1)}>{t('checkout.back')}</button>
                  <button className="btn-next" onClick={() => setStep(3)}>{t('checkout.next')}</button>
                </div>
              </div>
            )}

            {/* ── Step 3: Confirm ── */}
            {step === 3 && (
              <div className="co-card">
                <h2 className="co-card-title">
                  <ClipboardDocumentListIcon style={{ width: '18px', height: '18px', color: 'var(--theme-accent)' }} />
                  {t('checkout.step_confirm')}
                </h2>

                {/* Selected address summary */}
                {(() => {
                  const addr = addresses.find((a) => a.id === selectedAddressId);
                  return addr ? (
                    <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg)' }}>
                      <p style={{ margin: '0 0 2px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('checkout.selected_address')}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--theme-text-primary)' }}>
                        {addr.full_name} — {addr.address_line1}, {addr.city}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: 'var(--theme-text-secondary)' }}>
                        {addr.phone}
                      </p>
                    </div>
                  ) : null;
                })()}

                {/* Selected payment */}
                <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg)' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('checkout.selected_payment')}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--theme-text-primary)' }}>
                    {paymentMethod === 'cod' ? `💵 ${t('checkout.cod')}` : `📱 ${t('checkout.cliq')}`}
                  </p>
                </div>

                {/* Notes */}
                <div className="co-field">
                  <label>{t('checkout.notes')}</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('checkout.notes_placeholder')}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="btn-row">
                  <button className="btn-back" onClick={() => setStep(2)}>{t('checkout.back')}</button>
                  <button
                    className="btn-next"
                    onClick={handlePlaceOrder}
                    disabled={isPlacing || !selectedAddressId}
                    style={{ background: isPlacing ? 'var(--theme-border)' : 'var(--theme-accent)' }}
                  >
                    {isPlacing ? t('common.loading') : t('checkout.place_order')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary aside */}
          <div className="co-aside">
            <OrderSummaryAside
              items={items}
              subtotal={subtotal}
              shipping={shipping}
              discount={discount}
              voucherCode={voucherFromCart}
              lang={lang}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
