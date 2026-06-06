import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVendorBalance } from '../../hooks/api/useVendor';
import VendorLayout from '../../components/layout/VendorLayout';
import { formatPrice } from '../../utils/formatPrice';

const TX_STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  paid_out:  { bg: '#D1FAE5', text: '#065F46' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
};

const PAGE_SIZE = 15;

function SummaryCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: 'var(--theme-surface)', border: '1px solid var(--theme-border)',
      borderRadius: '12px', padding: '20px',
      display: 'flex', alignItems: 'flex-start', gap: '14px',
    }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '1.375rem' }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}

export default function VendorBalancePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useVendorBalance();
  const balance = data?.data ?? data ?? {};
  const allTx = balance.transactions ?? balance.recent_transactions ?? [];
  const vendor = balance.vendor ?? {};

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const totalPages = Math.max(1, Math.ceil(allTx.length / PAGE_SIZE));
  const pageTx = allTx.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return (
      <VendorLayout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[90, 200, 120].map((h, i) => (
            <div key={i} style={{ height: `${h}px`, borderRadius: '12px', background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', animation: 'pulse 1.4s ease infinite' }} />
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '24px' }}>
        {t('vendor.balance')}
      </h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <SummaryCard label={t('vendor.total_earned')} value={formatPrice(balance.total_earned ?? 0, lang)} icon="📈" color="#10B981" />
        <SummaryCard label={t('vendor.pending_payout')} value={formatPrice(balance.pending_payout ?? 0, lang)} icon="⏳" color="#F59E0B" />
        <SummaryCard label={t('vendor.paid_out')} value={formatPrice(balance.paid_out ?? 0, lang)} icon="✅" color="#10B981" />
      </div>

      {/* Export note */}
      <div style={{
        background: 'color-mix(in srgb, var(--theme-accent) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--theme-accent) 20%, transparent)',
        borderRadius: '10px', padding: '12px 16px',
        fontSize: '0.875rem', color: 'var(--theme-text-secondary)',
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '24px',
      }}>
        <span>ℹ️</span>
        {t('vendor.export_note')}
      </div>

      {/* Transactions table */}
      <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--theme-border)' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
            {lang === 'ar' ? 'جميع المعاملات' : 'All Transactions'}
          </h2>
        </div>

        {allTx.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
            {t('vendor.no_transactions')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                  {[t('vendor.col_date'), t('vendor.col_order'), t('vendor.col_product'), t('vendor.col_gross'), t('vendor.col_commission'), t('vendor.col_net'), t('vendor.col_status')].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'start', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageTx.map((tx, idx) => {
                  const c = TX_STATUS_COLORS[tx.status] ?? TX_STATUS_COLORS.pending;
                  return (
                    <tr key={tx.id ?? idx} style={{ borderBottom: '1px solid var(--theme-border)', background: idx % 2 === 0 ? 'var(--theme-surface)' : 'var(--theme-bg)' }}>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(tx.created_at)}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {tx.order_number ?? tx.order?.order_number ?? '—'}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lang === 'ar' ? (tx.product_name_ar ?? tx.product_name ?? '—') : (tx.product_name ?? tx.product_name_ar ?? '—')}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {formatPrice(tx.gross_amount ?? tx.amount ?? 0, lang)}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: '#EF4444', whiteSpace: 'nowrap' }}>
                        -{formatPrice(tx.commission_amount ?? tx.commission ?? 0, lang)}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', fontWeight: 700, color: '#10B981', whiteSpace: 'nowrap' }}>
                        {formatPrice(tx.net_amount ?? tx.net ?? 0, lang)}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.text, whiteSpace: 'nowrap' }}>
                          {t(`vendor.status_${tx.status}`, tx.status)}
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

      {/* Pagination for the client-side table */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '28px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: '7px 13px', borderRadius: '50px',
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

      {/* Bank account card */}
      <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text-primary)', marginBottom: '12px' }}>
          {t('vendor.bank_account')}
        </h3>
        {vendor.bank_account ? (
          <div style={{ fontSize: '0.9rem', color: 'var(--theme-text-primary)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
            {vendor.bank_account}
          </div>
        ) : (
          <p style={{ color: 'var(--theme-text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            {t('vendor.no_bank_account')}
          </p>
        )}
        <p style={{ marginTop: '10px', marginBottom: 0, fontSize: '0.8125rem', color: 'var(--theme-text-hint)' }}>
          {t('vendor.bank_note')}
        </p>
      </div>
    </VendorLayout>
  );
}
