import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../api/axios';

const STATUS_COLORS = {
  active:   { bg: '#D1FAE5', text: '#065F46' },
  archived: { bg: '#F3F4F6', text: '#6B7280' },
  draft:    { bg: '#FEF3C7', text: '#92400E' },
};

const FASHION_PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&h=80&fit=crop&auto=format';

function useAdminProducts(filters, page) {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['admin', 'products', filters, page, i18n.language],
    queryFn: () =>
      api.get('/products', {
        params: {
          ...filters,
          page,
          per_page: 20,
        },
      }).then((r) => r.data),
  });
}

export default function AdminProductsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [page,         setPage]         = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [search,       setSearch]       = useState('');

  const filters = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search       ? { search }               : {}),
  };

  const { data, isLoading } = useAdminProducts(filters, page);

  const products   = data?.data ?? [];
  const meta       = data?.meta ?? {};
  const totalPages = meta.last_page ?? 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const selectStyle = {
    padding: '9px 12px', borderRadius: '10px', fontSize: '0.875rem',
    border: '1px solid var(--theme-border)', background: 'var(--theme-surface)',
    color: 'var(--theme-text-primary)', fontFamily: 'inherit', cursor: 'pointer',
  };

  return (
    <AdminLayout>
      <style>{`@keyframes adm-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: 0 }}>
          {t('admin.products')}
        </h1>
        {meta.total != null && (
          <span style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)' }}>
            {meta.total} {lang === 'ar' ? 'منتج' : 'products'}
          </span>
        )}
      </div>

      {/* Note: read-only via public /api/products — gender scope applied */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--theme-text-hint)', marginBottom: '20px' }}>
        {lang === 'ar'
          ? 'عرض القراءة فقط — المنتجات من النقطة العامة (GenderScope مطبق). لا يوجد endpoint خاص بالمشرف حتى الآن.'
          : 'Read-only view — products from public endpoint (GenderScope applied). No admin-specific endpoint yet.'}
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'flex-end' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0', flex: '1 1 220px', minWidth: '200px', maxWidth: '340px' }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث في المنتجات...' : 'Search products...'}
            style={{ flex: 1, padding: '9px 14px', borderRadius: '10px 0 0 10px', fontSize: '0.875rem', border: '1px solid var(--theme-border)', borderInlineEnd: 'none', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', fontFamily: 'inherit' }}
          />
          <button type="submit" style={{ padding: '9px 14px', borderRadius: '0 10px 10px 0', border: '1px solid var(--theme-border)', background: 'var(--theme-accent)', color: 'var(--theme-surface)', cursor: 'pointer', fontFamily: 'inherit' }}>
            {lang === 'ar' ? 'بحث' : 'Search'}
          </button>
        </form>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">{t('admin.filter_all')}</option>
          <option value="active">{lang === 'ar' ? 'نشط' : 'Active'}</option>
          <option value="archived">{lang === 'ar' ? 'مؤرشف' : 'Archived'}</option>
          <option value="draft">{lang === 'ar' ? 'مسودة' : 'Draft'}</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ height: '56px', borderRadius: '8px', background: 'var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
            {t('admin.no_products')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                  {[t('admin.col_image'), t('admin.product_name') ?? (lang === 'ar' ? 'اسم المنتج' : 'Product'), t('admin.col_price'), t('admin.col_stock'), t('admin.col_status'), t('admin.col_actions')].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'start', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => {
                  const sc = STATUS_COLORS[product.status] ?? STATUS_COLORS.active;
                  const displayName = product.display_name ?? (lang === 'ar' ? product.name_ar : product.name) ?? product.name ?? '—';
                  const price = product.sale_price ?? product.base_price ?? 0;
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--theme-border)', background: idx % 2 === 0 ? 'var(--theme-surface)' : 'var(--theme-bg)' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <img
                          src={product.primary_image_url ?? FASHION_PLACEHOLDER}
                          alt=""
                          onError={(e) => { e.target.src = FASHION_PLACEHOLDER; }}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', background: 'var(--theme-border)' }}
                        />
                      </td>
                      <td style={{ padding: '11px 14px', minWidth: '160px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--theme-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          {displayName}
                        </div>
                        {product.brand && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-hint)', marginTop: '2px' }}>
                            {lang === 'ar' ? (product.brand_ar ?? product.brand) : product.brand}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {formatPrice(price, lang)}
                        {product.sale_price && product.base_price && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--theme-text-hint)', textDecoration: 'line-through' }}>
                            {formatPrice(product.base_price, lang)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                        {product.total_stock ?? '—'}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.text, whiteSpace: 'nowrap' }}>
                          {product.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active')
                           : product.status === 'archived' ? (lang === 'ar' ? 'مؤرشف' : 'Archived')
                           : (lang === 'ar' ? 'مسودة' : 'Draft')}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span
                          title={lang === 'ar' ? 'قريباً — لا يوجد admin endpoint' : 'Coming soon — no admin endpoint yet'}
                          style={{ fontSize: '0.75rem', color: 'var(--theme-text-hint)', cursor: 'help' }}
                        >
                          {t('admin.coming_soon')}
                        </span>
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
    </AdminLayout>
  );
}
