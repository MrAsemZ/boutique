import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import VendorLayout from '../../components/layout/VendorLayout';
import { useVendorProducts, useDeleteProduct } from '../../hooks/api/useVendorProducts';
import { formatPrice } from '../../utils/formatPrice';

const STATUS_COLORS = {
  active:   { bg: '#D1FAE5', text: '#065F46' },
  draft:    { bg: '#FEF3C7', text: '#92400E' },
  archived: { bg: '#F3F4F6', text: '#6B7280' },
};

const FASHION_PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=60&h=60&fit=crop&auto=format';

const TABS = ['', 'active', 'draft', 'archived'];

export default function VendorProductsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmArchive, setConfirmArchive] = useState(null); // product obj

  const filters = { ...(statusFilter ? { status: statusFilter } : {}), page };
  const { data, isLoading } = useVendorProducts(filters);
  const deleteProduct = useDeleteProduct();

  // ApiResponseTrait → paginator in data.data
  const paginator = data?.data ?? {};
  const products  = paginator?.data ?? [];
  const totalPages = paginator?.last_page ?? 1;
  const total      = paginator?.total ?? 0;

  const tabLabels = {
    '':         lang === 'ar' ? 'الكل'    : 'All',
    active:     lang === 'ar' ? 'نشط'     : 'Active',
    draft:      lang === 'ar' ? 'مسودة'   : 'Draft',
    archived:   lang === 'ar' ? 'مؤرشف'  : 'Archived',
  };

  const handleArchive = (product) => {
    setConfirmArchive(product);
  };

  const confirmDoArchive = () => {
    if (!confirmArchive) return;
    deleteProduct.mutate(confirmArchive.id, {
      onSuccess: () => {
        toast.success(lang === 'ar' ? 'تم أرشفة المنتج' : 'Product archived');
        setConfirmArchive(null);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? (lang === 'ar' ? 'حدث خطأ' : 'Error'));
        setConfirmArchive(null);
      },
    });
  };

  return (
    <VendorLayout>
      <style>{`@keyframes vp-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: 0 }}>
            {lang === 'ar' ? 'منتجاتي' : 'My Products'}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', marginTop: '4px' }}>
            {total} {lang === 'ar' ? 'منتج' : 'products'}
          </p>
        </div>
        <Link
          to="/vendor/products/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '50px',
            background: 'var(--theme-accent)', color: 'var(--theme-surface)',
            fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {lang === 'ar' ? 'إضافة منتج' : 'Add Product'}
        </Link>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0' }}>
        {TABS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{
              padding: '8px 16px', fontSize: '0.875rem', fontFamily: 'inherit',
              fontWeight: statusFilter === s ? 600 : 400, cursor: 'pointer', border: 'none',
              background: 'none', borderBottom: statusFilter === s ? '2px solid var(--theme-accent)' : '2px solid transparent',
              color: statusFilter === s ? 'var(--theme-accent)' : 'var(--theme-text-secondary)',
              marginBottom: '-1px',
            }}
          >
            {tabLabels[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: '60px', borderRadius: '8px', background: 'var(--theme-border)', animation: 'vp-pulse 1.4s ease infinite' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📦</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
              {lang === 'ar' ? 'لا توجد منتجات' : 'No products yet'}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)', marginBottom: '20px' }}>
              {lang === 'ar' ? 'ابدأ بإضافة منتجك الأول' : 'Start by adding your first product'}
            </div>
            <Link
              to="/vendor/products/new"
              style={{ padding: '10px 24px', borderRadius: '50px', background: 'var(--theme-accent)', color: 'var(--theme-surface)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}
            >
              {lang === 'ar' ? 'إضافة منتج' : 'Add Product'}
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                  {[
                    lang === 'ar' ? 'الصورة' : 'Image',
                    lang === 'ar' ? 'الاسم' : 'Name',
                    lang === 'ar' ? 'الفئة' : 'Category',
                    lang === 'ar' ? 'السعر' : 'Price',
                    lang === 'ar' ? 'المتغيرات' : 'Variants',
                    lang === 'ar' ? 'المخزون' : 'Stock',
                    lang === 'ar' ? 'الحالة' : 'Status',
                    lang === 'ar' ? 'الإجراءات' : 'Actions',
                  ].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'start', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => {
                  const sc = STATUS_COLORS[product.status] ?? STATUS_COLORS.draft;
                  const primaryImage = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
                  const displayName = product.display_name ?? (lang === 'ar' ? product.name_ar : product.name) ?? product.name ?? '—';
                  const categoryName = product.category
                    ? (lang === 'ar' ? (product.category.name_ar ?? product.category.name) : product.category.name)
                    : '—';
                  const price = product.sale_price ?? product.base_price ?? 0;

                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--theme-border)', background: idx % 2 === 0 ? 'var(--theme-surface)' : 'var(--theme-bg)' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <img
                          src={primaryImage?.url ?? FASHION_PLACEHOLDER}
                          alt=""
                          onError={(e) => { e.target.src = FASHION_PLACEHOLDER; }}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', background: 'var(--theme-border)' }}
                        />
                      </td>
                      <td style={{ padding: '11px 14px', minWidth: '160px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--theme-text-primary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {displayName}
                        </div>
                        {product.brand && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-hint)', marginTop: '2px' }}>
                            {lang === 'ar' ? (product.brand_ar ?? product.brand) : product.brand}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                        {categoryName}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {formatPrice(price, lang)}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', textAlign: 'center' }}>
                        {product.variants_count ?? 0}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', textAlign: 'center' }}>
                        {product.total_stock ?? 0}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.text, whiteSpace: 'nowrap' }}>
                          {product.status === 'active'   ? (lang === 'ar' ? 'نشط'    : 'Active')
                          : product.status === 'draft'   ? (lang === 'ar' ? 'مسودة'  : 'Draft')
                          :                               (lang === 'ar' ? 'مؤرشف'  : 'Archived')}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                          <button
                            onClick={() => navigate(`/vendor/products/${product.id}/edit`)}
                            style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '0.8125rem', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--theme-border)', color: 'var(--theme-text-primary)', background: 'none' }}
                          >
                            {lang === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                          <a
                            href={`/products/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--theme-border)', color: 'var(--theme-text-secondary)', background: 'none', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                          >
                            {lang === 'ar' ? 'عرض' : 'View'}
                          </a>
                          {product.status !== 'archived' && (
                            <button
                              onClick={() => handleArchive(product)}
                              style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '0.8125rem', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #EF4444', color: '#EF4444', background: 'none' }}
                            >
                              {lang === 'ar' ? 'أرشفة' : 'Archive'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Archive confirm dialog */}
      {confirmArchive && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
              {lang === 'ar' ? 'تأكيد الأرشفة' : 'Confirm Archive'}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.875rem', color: 'var(--theme-text-secondary)' }}>
              {lang === 'ar'
                ? `هل تريد أرشفة "${confirmArchive.name_ar ?? confirmArchive.name}"؟ سيصبح المنتج غير مرئي للعملاء.`
                : `Archive "${confirmArchive.name}"? The product will be hidden from customers.`}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmArchive(null)}
                style={{ padding: '8px 18px', borderRadius: '50px', border: '1.5px solid var(--theme-border)', background: 'none', color: 'var(--theme-text-primary)', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmDoArchive}
                disabled={deleteProduct.isPending}
                style={{ padding: '8px 18px', borderRadius: '50px', border: 'none', background: '#EF4444', color: '#fff', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', opacity: deleteProduct.isPending ? 0.6 : 1 }}
              >
                {lang === 'ar' ? 'أرشفة' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
