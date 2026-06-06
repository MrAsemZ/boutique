import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import VendorLayout from '../../components/layout/VendorLayout';
import {
  useVendorProduct,
  useCreateProduct,
  useUpdateProduct,
  useAddVariant,
  useUpdateVariant,
  useDeleteVariant,
  useAddImage,
  useDeleteImage,
} from '../../hooks/api/useVendorProducts';
import { useCategories } from '../../hooks/api/useCategories';

// ── helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function genSku(slug, size, color) {
  return [slugify(slug || 'product'), slugify(size || 'one'), slugify(color || 'default')]
    .join('-')
    .slice(0, 60);
}

// ── sub-components ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: '42px', height: '24px', borderRadius: '50px',
          background: checked ? 'var(--theme-accent)' : 'var(--theme-border)',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0, cursor: 'pointer',
        }}
      >
        <div style={{
          position: 'absolute', top: '3px',
          insetInlineStart: checked ? '21px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: '#fff', transition: 'inset-inline-start 0.2s',
        }} />
      </div>
      <span style={{ fontSize: '0.875rem', color: 'var(--theme-text-primary)' }}>{label}</span>
    </label>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: '0 0 18px' }}>{title}</h2>
      {children}
    </div>
  );
}

// ── VariantRow ────────────────────────────────────────────────────────────────

function VariantRow({ variant, lang, productId, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    stock: variant.stock,
    price_override: variant.price_override ?? '',
    is_active: variant.is_active,
  });
  const updateVariant = useUpdateVariant(productId);
  const deleteVariant = useDeleteVariant(productId);
  const [confirmDel, setConfirmDel] = useState(false);

  const handleSave = () => {
    updateVariant.mutate({ id: variant.id, ...form, price_override: form.price_override === '' ? null : form.price_override }, {
      onSuccess: () => { toast.success(lang === 'ar' ? 'تم تحديث المتغير' : 'Variant updated'); setEditing(false); onUpdated?.(); },
      onError: (e) => toast.error(e?.response?.data?.message ?? 'Error'),
    });
  };

  const handleDelete = () => {
    deleteVariant.mutate(variant.id, {
      onSuccess: () => { toast.success(lang === 'ar' ? 'تم حذف المتغير' : 'Variant removed'); onDeleted?.(); },
      onError: (e) => toast.error(e?.response?.data?.message ?? 'Error'),
    });
  };

  const cellStyle = { padding: '8px 10px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' };
  const inputStyle = { padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--theme-border)', background: 'var(--theme-bg)', color: 'var(--theme-text-primary)', fontFamily: 'inherit', fontSize: '0.8125rem', width: '80px' };

  return (
    <tr style={{ borderBottom: '1px solid var(--theme-border)' }}>
      <td style={cellStyle}>{variant.size}</td>
      <td style={cellStyle}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          {variant.color_hex && <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: variant.color_hex, border: '1px solid var(--theme-border)', display: 'inline-block' }} />}
          {variant.color}
        </span>
      </td>
      <td style={cellStyle}>{variant.material ?? '—'}</td>
      <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: '0.75rem' }}>{variant.sku}</td>
      <td style={cellStyle}>
        {editing ? (
          <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} style={inputStyle} />
        ) : variant.stock}
      </td>
      <td style={cellStyle}>
        {editing ? (
          <input type="number" min="0" step="0.01" value={form.price_override} onChange={(e) => setForm({ ...form, price_override: e.target.value })} placeholder="—" style={inputStyle} />
        ) : (variant.price_override ?? '—')}
      </td>
      <td style={cellStyle}>
        {confirmDel ? (
          <span style={{ display: 'inline-flex', gap: '4px' }}>
            <button onClick={handleDelete} disabled={deleteVariant.isPending} style={{ padding: '3px 8px', borderRadius: '6px', border: 'none', background: '#EF4444', color: '#fff', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}>
              {lang === 'ar' ? 'نعم' : 'Yes'}
            </button>
            <button onClick={() => setConfirmDel(false)} style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}>
              {lang === 'ar' ? 'لا' : 'No'}
            </button>
          </span>
        ) : editing ? (
          <span style={{ display: 'inline-flex', gap: '4px' }}>
            <button onClick={handleSave} disabled={updateVariant.isPending} style={{ padding: '3px 8px', borderRadius: '6px', border: 'none', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}>
              {lang === 'ar' ? 'حفظ' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </span>
        ) : (
          <span style={{ display: 'inline-flex', gap: '4px' }}>
            <button onClick={() => setEditing(true)} style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-primary)', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}>
              {lang === 'ar' ? 'تعديل' : 'Edit'}
            </button>
            <button onClick={() => setConfirmDel(true)} style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #EF4444', background: 'none', color: '#EF4444', fontFamily: 'inherit', fontSize: '0.75rem', cursor: 'pointer' }}>
              {lang === 'ar' ? 'حذف' : 'Delete'}
            </button>
          </span>
        )}
      </td>
    </tr>
  );
}

// ── AddVariantForm ────────────────────────────────────────────────────────────

function AddVariantForm({ productId, productSlug, lang, onDone }) {
  const [form, setForm] = useState({ size: '', color: '', color_hex: '', material: '', material_ar: '', stock: 0, price_override: '', sku: '' });
  const addVariant = useAddVariant(productId);

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    if (k === 'size' || k === 'color') {
      next.sku = genSku(productSlug, k === 'size' ? v : next.size, k === 'color' ? v : next.color);
    }
    setForm(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.sku) { toast.error('SKU is required'); return; }
    addVariant.mutate({
      ...form,
      stock: +form.stock,
      price_override: form.price_override === '' ? null : +form.price_override,
      color_hex: form.color_hex || null,
      material: form.material || null,
      material_ar: form.material_ar || null,
    }, {
      onSuccess: () => { toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Variant added'); onDone(); },
      onError: (e) => toast.error(e?.response?.data?.message ?? 'Error'),
    });
  };

  const iStyle = { padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', fontFamily: 'inherit', fontSize: '0.875rem', width: '100%' };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--theme-bg)', border: '1px solid var(--theme-border)', borderRadius: '10px', padding: '16px', marginTop: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        {[
          { key: 'size', label: lang === 'ar' ? 'المقاس *' : 'Size *', placeholder: 'S, M, L, XL' },
          { key: 'color', label: lang === 'ar' ? 'اللون *' : 'Color *', placeholder: lang === 'ar' ? 'أسود' : 'Black' },
          { key: 'material', label: lang === 'ar' ? 'المادة' : 'Material', placeholder: 'Cotton' },
          { key: 'material_ar', label: lang === 'ar' ? 'المادة (ع)' : 'Material (AR)', placeholder: 'قطن' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>{label}</label>
            <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} style={iStyle} />
          </div>
        ))}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>{lang === 'ar' ? 'كود اللون' : 'Color Hex'}</label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input type="color" value={form.color_hex || '#000000'} onChange={(e) => set('color_hex', e.target.value)} style={{ width: '36px', height: '36px', border: '1px solid var(--theme-border)', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
            <input value={form.color_hex} onChange={(e) => set('color_hex', e.target.value)} placeholder="#000000" style={{ ...iStyle, flex: 1 }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>{lang === 'ar' ? 'المخزون *' : 'Stock *'}</label>
          <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} style={iStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>{lang === 'ar' ? 'سعر خاص (JOD)' : 'Price Override (JOD)'}</label>
          <input type="number" min="0" step="0.01" value={form.price_override} onChange={(e) => set('price_override', e.target.value)} placeholder={lang === 'ar' ? 'اختياري' : 'Optional'} style={iStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>SKU *</label>
          <input value={form.sku} onChange={(e) => set('sku', e.target.value)} style={iStyle} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onDone} style={{ padding: '7px 16px', borderRadius: '50px', border: '1px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-secondary)', fontFamily: 'inherit', cursor: 'pointer' }}>
          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
        <button type="submit" disabled={addVariant.isPending} style={{ padding: '7px 16px', borderRadius: '50px', border: 'none', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', opacity: addVariant.isPending ? 0.6 : 1 }}>
          {lang === 'ar' ? 'إضافة' : 'Add Variant'}
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VendorProductFormPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { id } = useParams(); // undefined on /vendor/products/new
  const isEdit = !!id;

  const { data: productData, isLoading: productLoading } = useVendorProduct(id);
  const { data: categoriesData } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const addImage   = useAddImage(id);
  const deleteImage = useDeleteImage(id);

  const [showAddVariant, setShowAddVariant] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageIsPrimary, setImageIsPrimary] = useState(false);

  const [form, setForm] = useState({
    name: '', name_ar: '', description: '', description_ar: '',
    category_id: '', base_price: '', sale_price: '',
    brand: '', brand_ar: '', status: 'draft',
    is_featured: false, is_exclusive_women: false,
  });

  const product = productData?.data;

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        name_ar: product.name_ar ?? '',
        description: product.description ?? '',
        description_ar: product.description_ar ?? '',
        category_id: product.category_id ?? '',
        base_price: product.base_price ?? '',
        sale_price: product.sale_price ?? '',
        brand: product.brand ?? '',
        brand_ar: product.brand_ar ?? '',
        status: product.status ?? 'draft',
        is_featured: product.is_featured ?? false,
        is_exclusive_women: product.is_exclusive_women ?? false,
      });
    }
  }, [product?.id]);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const categories = categoriesData?.data ?? [];

  const priceMismatch = form.sale_price !== '' && form.base_price !== '' && +form.sale_price >= +form.base_price;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      base_price: +form.base_price,
      sale_price: form.sale_price === '' ? null : +form.sale_price,
      is_featured: !!form.is_featured,
      is_exclusive_women: !!form.is_exclusive_women,
    };

    if (isEdit) {
      updateProduct.mutate({ id: +id, ...payload }, {
        onSuccess: () => { toast.success(lang === 'ar' ? 'تم تحديث المنتج' : 'Product updated'); navigate('/vendor/products'); },
        onError: (err) => toast.error(err?.response?.data?.message ?? (lang === 'ar' ? 'حدث خطأ' : 'Error')),
      });
    } else {
      createProduct.mutate(payload, {
        onSuccess: (res) => {
          toast.success(lang === 'ar' ? 'تم إنشاء المنتج' : 'Product created');
          const newId = res?.data?.id;
          navigate(newId ? `/vendor/products/${newId}/edit` : '/vendor/products');
        },
        onError: (err) => toast.error(err?.response?.data?.message ?? (lang === 'ar' ? 'حدث خطأ' : 'Error')),
      });
    }
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    addImage.mutate({ url: imageUrl.trim(), is_primary: imageIsPrimary }, {
      onSuccess: () => { toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Image added'); setImageUrl(''); setImageIsPrimary(false); },
      onError: (e) => toast.error(e?.response?.data?.message ?? 'Error'),
    });
  };

  const iStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', fontFamily: 'inherit', fontSize: '0.9rem' };
  const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-secondary)', marginBottom: '6px' };

  if (isEdit && productLoading) {
    return (
      <VendorLayout>
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
          {lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div style={{ maxWidth: '780px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/vendor/products')}
            style={{ background: 'none', border: '1px solid var(--theme-border)', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', color: 'var(--theme-text-secondary)', display: 'flex', alignItems: 'center' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: 0 }}>
            {isEdit ? (lang === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (lang === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Basic Info */}
          <SectionCard title={lang === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الاسم (EN) *' : 'Product Name (EN) *'}</label>
                <input required value={form.name} onChange={(e) => set('name', e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الاسم (AR) *' : 'Product Name (AR) *'}</label>
                <input required value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} dir="rtl" style={iStyle} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>{lang === 'ar' ? 'الوصف (EN) *' : 'Description (EN) *'}</label>
                <textarea required value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} style={{ ...iStyle, resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>{lang === 'ar' ? 'الوصف (AR) *' : 'Description (AR) *'}</label>
                <textarea required value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} rows={3} dir="rtl" style={{ ...iStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الفئة *' : 'Category *'}</label>
                <select required value={form.category_id} onChange={(e) => set('category_id', e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                  <option value="">{lang === 'ar' ? 'اختر الفئة' : 'Select category'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {lang === 'ar' ? (cat.name_ar ?? cat.name) : cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div />
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الماركة (EN)' : 'Brand (EN)'}</label>
                <input value={form.brand} onChange={(e) => set('brand', e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'الماركة (AR)' : 'Brand (AR)'}</label>
                <input value={form.brand_ar} onChange={(e) => set('brand_ar', e.target.value)} dir="rtl" style={iStyle} />
              </div>
            </div>
          </SectionCard>

          {/* 2. Pricing */}
          <SectionCard title={lang === 'ar' ? 'التسعير' : 'Pricing'}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'السعر الأساسي (JOD) *' : 'Base Price (JOD) *'}</label>
                <input required type="number" min="0" step="0.01" value={form.base_price} onChange={(e) => set('base_price', e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'ar' ? 'سعر الخصم (JOD)' : 'Sale Price (JOD)'}</label>
                <input type="number" min="0" step="0.01" value={form.sale_price} onChange={(e) => set('sale_price', e.target.value)} placeholder={lang === 'ar' ? 'اختياري' : 'Optional'} style={{ ...iStyle, borderColor: priceMismatch ? '#EF4444' : undefined }} />
              </div>
            </div>
            {priceMismatch && (
              <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: '#EF4444' }}>
                {lang === 'ar' ? 'يجب أن يكون سعر الخصم أقل من السعر الأساسي' : 'Sale price must be less than base price'}
              </p>
            )}
          </SectionCard>

          {/* 3. Settings */}
          <SectionCard title={lang === 'ar' ? 'الإعدادات' : 'Settings'}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{lang === 'ar' ? 'الحالة' : 'Status'}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['draft', 'active'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('status', s)}
                    style={{
                      padding: '7px 18px', borderRadius: '50px', fontFamily: 'inherit',
                      border: `1.5px solid ${form.status === s ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                      background: form.status === s ? 'var(--theme-accent)' : 'none',
                      color: form.status === s ? 'var(--theme-surface)' : 'var(--theme-text-secondary)',
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {s === 'draft' ? (lang === 'ar' ? 'مسودة' : 'Draft') : (lang === 'ar' ? 'نشط' : 'Active')}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Toggle checked={form.is_featured} onChange={(v) => set('is_featured', v)} label={lang === 'ar' ? 'منتج مميز' : 'Featured product'} />
              <Toggle checked={form.is_exclusive_women} onChange={(v) => set('is_exclusive_women', v)} label={lang === 'ar' ? 'حصري للنساء' : 'Exclusive to women'} />
              {form.is_exclusive_women && (
                <p style={{ fontSize: '0.8125rem', color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '8px 12px', margin: 0 }}>
                  {lang === 'ar' ? 'هذا المنتج لن يظهر للرجال والزوار' : 'This product will not be visible to male users or guests'}
                </p>
              )}
            </div>
          </SectionCard>

          {/* Save / Cancel */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending || priceMismatch}
              style={{ padding: '11px 28px', borderRadius: '50px', border: 'none', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', opacity: (createProduct.isPending || updateProduct.isPending) ? 0.6 : 1 }}
            >
              {isEdit ? (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes') : (lang === 'ar' ? 'إنشاء المنتج' : 'Create Product')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              style={{ padding: '11px 24px', borderRadius: '50px', border: '1.5px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-primary)', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer' }}
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>

        {/* 4. Variants — only shown for existing products */}
        {isEdit && product && (
          <SectionCard title={lang === 'ar' ? 'المتغيرات' : 'Variants'}>
            {product.variants?.length > 0 ? (
              <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px' }}>
                  <thead>
                    <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                      {[lang === 'ar' ? 'المقاس' : 'Size', lang === 'ar' ? 'اللون' : 'Color', lang === 'ar' ? 'المادة' : 'Material', 'SKU', lang === 'ar' ? 'المخزون' : 'Stock', lang === 'ar' ? 'سعر خاص' : 'Price Override', ''].map((h) => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'start', fontSize: '0.72rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <VariantRow key={v.id} variant={v} lang={lang} productId={+id} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)', marginBottom: '12px' }}>
                {lang === 'ar' ? 'لا توجد متغيرات بعد' : 'No variants yet'}
              </p>
            )}

            {showAddVariant ? (
              <AddVariantForm productId={+id} productSlug={product.slug} lang={lang} onDone={() => setShowAddVariant(false)} />
            ) : (
              <button
                type="button"
                onClick={() => setShowAddVariant(true)}
                style={{ padding: '8px 18px', borderRadius: '50px', border: '1.5px dashed var(--theme-accent)', background: 'none', color: 'var(--theme-accent)', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                + {lang === 'ar' ? 'إضافة متغير' : 'Add Variant'}
              </button>
            )}
          </SectionCard>
        )}

        {/* 5. Images — only shown for existing products */}
        {isEdit && product && (
          <SectionCard title={lang === 'ar' ? 'الصور' : 'Images'}>
            {product.images?.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {product.images.map((img) => (
                  <div key={img.id} style={{ position: 'relative' }}>
                    <img src={img.url} alt="" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&h=80&fit=crop'; }} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: img.is_primary ? '2px solid var(--theme-accent)' : '1px solid var(--theme-border)' }} />
                    {img.is_primary && (
                      <span style={{ position: 'absolute', top: '4px', insetInlineStart: '4px', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
                        {lang === 'ar' ? 'رئيسية' : 'Primary'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteImage.mutate(img.id, { onSuccess: () => toast.success(lang === 'ar' ? 'تم الحذف' : 'Removed'), onError: (e) => toast.error(e?.response?.data?.message ?? 'Error') })}
                      style={{ position: 'absolute', top: '4px', insetInlineEnd: '4px', width: '20px', height: '20px', borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 260px' }}>
                <label style={labelStyle}>{lang === 'ar' ? 'رابط الصورة' : 'Image URL'}</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." style={{ ...iStyle, width: '100%' }} />
              </div>
              <Toggle checked={imageIsPrimary} onChange={setImageIsPrimary} label={lang === 'ar' ? 'رئيسية' : 'Primary'} />
              <button
                type="button"
                onClick={handleAddImage}
                disabled={!imageUrl.trim() || addImage.isPending}
                style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', opacity: !imageUrl.trim() ? 0.5 : 1 }}
              >
                {lang === 'ar' ? 'إضافة' : 'Add'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--theme-text-hint)', marginTop: '8px' }}>
              {lang === 'ar' ? 'ملاحظة: لرفع الصور مباشرة، يلزم إعداد مساحة تخزين. حالياً يُقبل رابط URL فقط.' : 'Note: Direct file upload requires storage setup. Currently only image URLs are accepted.'}
            </p>
          </SectionCard>
        )}

        {isEdit && !product && (
          <p style={{ fontSize: '0.875rem', color: 'var(--theme-text-hint)', textAlign: 'center' }}>
            {lang === 'ar' ? 'احفظ المنتج أولاً ثم يمكنك إضافة المتغيرات والصور' : 'Save the product first, then you can add variants and images'}
          </p>
        )}
      </div>
    </VendorLayout>
  );
}
