import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from '../../hooks/api/useAddresses';
import AccountLayout from '../../components/layout/AccountLayout';

const LABEL_OPTIONS = ['home', 'work', 'other'];

const EMPTY_FORM = {
  label: 'home',
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  country: '',
  is_default: false,
};

function AddressForm({ initial, onSubmit, onCancel, isLoading }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const setField = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = t('common.error');
    if (!form.phone.trim()) errs.phone = t('common.error');
    if (!form.address_line1.trim()) errs.address_line1 = t('common.error');
    if (!form.city.trim()) errs.city = t('common.error');
    if (!form.country.trim()) errs.country = t('common.error');
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit(form);
  };

  const inputStyle = (key) => ({
    padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem',
    border: `1px solid ${errors[key] ? '#EF4444' : 'var(--theme-border)'}`,
    background: 'var(--theme-surface)', color: 'var(--theme-text-primary)',
    width: '100%', boxSizing: 'border-box', outline: 'none',
  });

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Label pills */}
      <div>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', display: 'block', marginBottom: '8px' }}>
          {t('addresses.label')}
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {LABEL_OPTIONS.map((opt) => (
            <button
              key={opt} type="button"
              onClick={() => setForm((f) => ({ ...f, label: opt }))}
              style={{
                padding: '7px 16px', borderRadius: '50px', fontSize: '0.875rem',
                fontWeight: form.label === opt ? 600 : 400, cursor: 'pointer',
                border: `1.5px solid ${form.label === opt ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                background: form.label === opt ? 'color-mix(in srgb, var(--theme-accent) 12%, transparent)' : 'none',
                color: form.label === opt ? 'var(--theme-accent)' : 'var(--theme-text-secondary)',
              }}
            >
              {t(`addresses.${opt}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { key: 'full_name', label: t('addresses.full_name'), type: 'text' },
          { key: 'phone', label: t('addresses.phone'), type: 'tel' },
        ].map(({ key, label, type }) => (
          <div key={key}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', display: 'block', marginBottom: '4px' }}>{label}</label>
            <input type={type} value={form[key]} onChange={setField(key)} style={inputStyle(key)} />
            {errors[key] && <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>{errors[key]}</span>}
          </div>
        ))}
      </div>

      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', display: 'block', marginBottom: '4px' }}>{t('addresses.line1')}</label>
        <input value={form.address_line1} onChange={setField('address_line1')} style={inputStyle('address_line1')} />
        {errors.address_line1 && <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>{errors.address_line1}</span>}
      </div>

      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', display: 'block', marginBottom: '4px' }}>{t('addresses.line2')}</label>
        <input value={form.address_line2} onChange={setField('address_line2')} style={inputStyle('address_line2')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { key: 'city', label: t('addresses.city') },
          { key: 'country', label: t('addresses.country') },
        ].map(({ key, label }) => (
          <div key={key}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', display: 'block', marginBottom: '4px' }}>{label}</label>
            <input value={form[key]} onChange={setField(key)} style={inputStyle(key)} />
            {errors[key] && <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>{errors[key]}</span>}
          </div>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--theme-text-primary)' }}>
        <input type="checkbox" checked={form.is_default} onChange={setField('is_default')} style={{ width: '16px', height: '16px', accentColor: 'var(--theme-accent)' }} />
        {t('addresses.is_default')}
      </label>

      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <button
          type="button" onClick={onCancel}
          style={{
            flex: 1, padding: '11px', borderRadius: '50px',
            border: '1.5px solid var(--theme-border)', background: 'none',
            color: 'var(--theme-text-secondary)', fontWeight: 500, cursor: 'pointer',
          }}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit" disabled={isLoading}
          style={{
            flex: 1, padding: '11px', borderRadius: '50px',
            border: 'none', background: 'var(--theme-accent)',
            color: 'var(--theme-surface)', fontWeight: 600, cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? t('common.loading') : t('addresses.save')}
        </button>
      </div>
    </form>
  );
}

function AddressCard({ address, total, onEdit, onDelete, onSetDefault }) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{
      background: 'var(--theme-surface)', border: `1.5px solid ${address.is_default ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
      borderRadius: '14px', padding: '18px', position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px',
            background: 'color-mix(in srgb, var(--theme-accent) 10%, transparent)',
            color: 'var(--theme-accent)', textTransform: 'uppercase',
          }}>
            {t(`addresses.${address.label}`, address.label)}
          </span>
          {address.is_default && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px',
              background: '#D1FAE5', color: '#065F46',
            }}>
              {t('addresses.default')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={onEdit} style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>
            {t('addresses.edit')}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={total <= 1}
            style={{
              padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--theme-border)',
              background: 'none', color: '#EF4444', fontSize: '0.8rem', cursor: total <= 1 ? 'not-allowed' : 'pointer',
              opacity: total <= 1 ? 0.4 : 1,
            }}
          >
            {t('addresses.delete')}
          </button>
        </div>
      </div>

      <div style={{ fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '4px' }}>{address.full_name}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)', lineHeight: 1.7 }}>
        {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}<br />
        {address.city}{address.country ? `, ${address.country}` : ''}<br />
        {address.phone}
      </div>

      {!address.is_default && (
        <button
          onClick={onSetDefault}
          style={{ marginTop: '12px', fontSize: '0.8125rem', color: 'var(--theme-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
        >
          {t('addresses.set_default')}
        </button>
      )}

      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{ background: 'var(--theme-surface)', borderRadius: '16px', padding: '28px', maxWidth: '340px', width: '100%', textAlign: 'center' }}>
            <p style={{ fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '20px' }}>{t('addresses.delete_confirm')}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '10px', borderRadius: '50px', border: '1.5px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
              <button
                onClick={() => { onDelete(); setConfirmDelete(false); }}
                style={{ flex: 1, padding: '10px', borderRadius: '50px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}
              >
                {t('addresses.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddressPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [mode, setMode] = useState(null); // null | 'add' | { edit: address }
  const addresses = data?.data ?? [];

  const handleSave = (form) => {
    if (mode === 'add') {
      createAddress.mutate(form, {
        onSuccess: () => { toast.success(t('addresses.save_success')); setMode(null); },
        onError: () => toast.error(t('common.error')),
      });
    } else {
      updateAddress.mutate({ id: mode.edit.id, ...form }, {
        onSuccess: () => { toast.success(t('addresses.save_success')); setMode(null); },
        onError: () => toast.error(t('common.error')),
      });
    }
  };

  const handleDelete = (id) => {
    deleteAddress.mutate(id, {
      onSuccess: () => toast.success(t('addresses.delete_success')),
      onError: () => toast.error(t('common.error')),
    });
  };

  return (
    <AccountLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
          {t('addresses.title')}
        </h1>
        {!mode && (
          <button
            onClick={() => setMode('add')}
            style={{
              padding: '10px 20px', borderRadius: '50px',
              background: 'var(--theme-accent)', color: 'var(--theme-surface)',
              fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            + {t('addresses.add')}
          </button>
        )}
      </div>

      {mode && (
        <div style={{
          background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
          borderRadius: '14px', padding: '24px', marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '20px' }}>
            {mode === 'add' ? t('addresses.add_title') : t('addresses.edit_title')}
          </h2>
          <AddressForm
            initial={mode === 'add' ? undefined : { ...mode.edit }}
            onSubmit={handleSave}
            onCancel={() => setMode(null)}
            isLoading={createAddress.isPending || updateAddress.isPending}
          />
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ height: '140px', borderRadius: '14px', background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', animation: 'pulse 1.4s ease infinite' }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
        </div>
      )}

      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              total={addresses.length}
              onEdit={() => setMode({ edit: addr })}
              onDelete={() => handleDelete(addr.id)}
              onSetDefault={() => setDefault.mutate(addr.id)}
            />
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
