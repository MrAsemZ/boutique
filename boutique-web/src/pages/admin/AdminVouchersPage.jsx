import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  useAdminVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
} from '../../hooks/api/useAdmin';

const EMPTY_FORM = {
  code: '',
  type: 'percentage',
  value: '',
  min_order: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
};

function VoucherForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading, lang, t }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = lang === 'ar' ? 'مطلوب' : 'Required';
    if (!form.type) e.type = lang === 'ar' ? 'مطلوب' : 'Required';
    if (form.type === 'percentage' && (!form.value || Number(form.value) < 1 || Number(form.value) > 100))
      e.value = lang === 'ar' ? 'يجب أن تكون بين 1 و 100' : 'Must be between 1 and 100';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      code:      form.code.toUpperCase(),
      type:      form.type,
      value:     form.type === 'percentage' ? Number(form.value) : undefined,
      min_order: form.min_order ? Number(form.min_order) : undefined,
      max_uses:  form.max_uses  ? Number(form.max_uses)  : undefined,
      expires_at: form.expires_at || undefined,
      is_active: form.is_active,
    });
  };

  const inp = (key, extra = {}) => ({
    value: form[key],
    onChange: set(key),
    style: {
      padding: '9px 12px', borderRadius: '10px', fontSize: '0.875rem',
      border: `1px solid ${errors[key] ? '#EF4444' : 'var(--theme-border)'}`,
      background: 'var(--theme-surface)', color: 'var(--theme-text-primary)',
      fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
    },
    ...extra,
  });

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Code */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '5px' }}>
          {t('admin.voucher_code')} *
        </label>
        <input
          {...inp('code')}
          placeholder="SAVE20"
          onChange={(e) => { e.target.value = e.target.value.toUpperCase(); set('code')(e); }}
        />
        {errors.code && <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>{errors.code}</span>}
      </div>

      {/* Type pill selector */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '8px' }}>
          {t('admin.voucher_type')} *
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['percentage', 'free_shipping'].map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: tp }))}
              style={{
                padding: '8px 16px', borderRadius: '50px', fontSize: '0.875rem',
                fontFamily: 'inherit', cursor: 'pointer', fontWeight: form.type === tp ? 700 : 400,
                background: form.type === tp ? 'var(--theme-accent)' : 'none',
                color: form.type === tp ? 'var(--theme-surface)' : 'var(--theme-text-secondary)',
                border: `1.5px solid ${form.type === tp ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
              }}
            >
              {t(`admin.voucher_type_${tp}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Value (only for percentage) */}
      {form.type === 'percentage' && (
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '5px' }}>
            {t('admin.voucher_value')} % *
          </label>
          <input type="number" min="1" max="100" {...inp('value')} placeholder="20" />
          {errors.value && <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>{errors.value}</span>}
        </div>
      )}

      {/* Min order & max uses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '5px' }}>
            {t('admin.voucher_min_order')}
          </label>
          <input type="number" min="0" step="0.01" {...inp('min_order')} placeholder="0.00" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '5px' }}>
            {t('admin.voucher_max_uses')}
          </label>
          <input type="number" min="1" {...inp('max_uses')} placeholder={lang === 'ar' ? 'غير محدود' : 'Unlimited'} />
        </div>
      </div>

      {/* Expiry */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '5px' }}>
          {t('admin.voucher_expires_label')}
        </label>
        <input type="date" {...inp('expires_at')} min={new Date().toISOString().slice(0, 10)} />
      </div>

      {/* Active toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={set('is_active')}
          style={{ width: '18px', height: '18px', accentColor: 'var(--theme-accent)' }}
        />
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--theme-text-primary)' }}>
          {lang === 'ar' ? 'نشط' : 'Active'}
        </span>
      </label>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
        <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: '50px', background: 'var(--theme-accent)', color: 'var(--theme-surface)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
          {loading ? (lang === 'ar' ? 'جارٍ...' : 'Saving...') : (lang === 'ar' ? 'حفظ' : 'Save')}
        </button>
      </div>
    </form>
  );
}

export default function AdminVouchersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [page,       setPage]       = useState(1);
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);

  const { data, isLoading } = useAdminVouchers({}, page);
  const create = useCreateVoucher();
  const update = useUpdateVoucher();
  const remove = useDeleteVoucher();

  const paginator  = data?.data ?? {};
  const vouchers   = paginator?.data ?? [];
  const totalPages = paginator?.last_page ?? 1;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const handleCreate = (formData) => {
    create.mutate(formData, {
      onSuccess: () => {
        toast.success(lang === 'ar' ? 'تم إنشاء القسيمة' : 'Voucher created');
        setShowForm(false);
      },
      onError: (err) => {
        const msgs = err?.response?.data?.errors;
        toast.error(msgs ? Object.values(msgs).flat().join(' ') : (lang === 'ar' ? 'حدث خطأ' : 'Error'));
      },
    });
  };

  const handleUpdate = (formData) => {
    update.mutate({ id: editTarget.id, ...formData }, {
      onSuccess: () => {
        toast.success(lang === 'ar' ? 'تم تحديث القسيمة' : 'Voucher updated');
        setEditTarget(null);
      },
      onError: (err) => {
        const msgs = err?.response?.data?.errors;
        toast.error(msgs ? Object.values(msgs).flat().join(' ') : (lang === 'ar' ? 'حدث خطأ' : 'Error'));
      },
    });
  };

  const handleDelete = (id) => {
    remove.mutate(id, {
      onSuccess: () => { toast.success(lang === 'ar' ? 'تم حذف القسيمة' : 'Voucher deleted'); setDeleteId(null); },
      onError: () => toast.error(lang === 'ar' ? 'حدث خطأ' : 'Error'),
    });
  };

  return (
    <AdminLayout>
      <style>{`@keyframes adm-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      {/* Modal overlay for create/edit */}
      {(showForm || editTarget) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--theme-surface)', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', border: '1px solid var(--theme-border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '20px' }}>
              {editTarget ? t('admin.edit_voucher') : t('admin.add_voucher')}
            </h3>
            <VoucherForm
              initial={editTarget ?? EMPTY_FORM}
              onSubmit={editTarget ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditTarget(null); }}
              loading={create.isPending || update.isPending}
              lang={lang}
              t={t}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: 0 }}>
          {t('admin.vouchers')}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: '10px 20px', borderRadius: '50px', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + {t('admin.add_voucher')}
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: '44px', borderRadius: '8px', background: 'var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
            {t('admin.no_vouchers')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                  {[t('admin.voucher_code'), t('admin.voucher_type'), t('admin.voucher_value'), t('admin.voucher_min_order'), t('admin.voucher_usage'), t('admin.voucher_expires'), t('admin.col_status'), t('admin.col_actions')].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'start', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v, idx) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--theme-border)', background: idx % 2 === 0 ? 'var(--theme-surface)' : 'var(--theme-bg)' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--theme-text-primary)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {v.code}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                      {t(`admin.voucher_type_${v.type}`, v.type)}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                      {v.type === 'percentage' ? `${v.value}%` : '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                      {v.min_order ? `${v.min_order} ${lang === 'ar' ? 'د.أ' : 'JOD'}` : '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                      {v.used_count ?? 0}{v.max_uses ? ` / ${v.max_uses}` : ''}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(v.expires_at)}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', background: v.is_active ? '#D1FAE5' : '#FEE2E2', color: v.is_active ? '#065F46' : '#991B1B' }}>
                        {v.is_active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطّل' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setEditTarget({ ...v, expires_at: v.expires_at ? v.expires_at.slice(0, 10) : '', value: v.value ?? '' })}
                          title={t('admin.edit_voucher')}
                          style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          ✏️
                        </button>
                        {deleteId === v.id ? (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleDelete(v.id)}
                              disabled={remove.isPending}
                              style={{ padding: '4px 10px', borderRadius: '8px', background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit', fontWeight: 600 }}
                            >
                              {lang === 'ar' ? 'نعم' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit' }}
                            >
                              {lang === 'ar' ? 'لا' : 'No'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(v.id)}
                            title={t('admin.delete_voucher')}
                            style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #FCA5A5', background: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.875rem' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: '7px 13px', borderRadius: '50px', fontFamily: 'inherit',
                border: `1.5px solid ${p === page ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                background: p === page ? 'var(--theme-accent)' : 'none',
                color: p === page ? 'var(--theme-surface)' : 'var(--theme-text-secondary)',
                cursor: 'pointer', fontWeight: p === page ? 600 : 400, fontSize: '0.875rem',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
