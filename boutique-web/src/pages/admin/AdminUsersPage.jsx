import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAdminUsers, useToggleUserStatus } from '../../hooks/api/useAdmin';
import { useAuthStore } from '../../stores/authStore';

const ROLE_COLORS = {
  admin:    { bg: '#EDE9FE', text: '#5B21B6' },
  vendor:   { bg: '#DBEAFE', text: '#1E40AF' },
  customer: { bg: '#F3F4F6', text: '#6B7280' },
};

export default function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { user: me } = useAuthStore();

  const [search,      setSearch]      = useState('');
  const [role,        setRole]        = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page,        setPage]        = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const filters = {
    ...(role         ? { role }          : {}),
    ...(activeFilter !== '' ? { active: activeFilter } : {}),
    ...(search       ? { search }        : {}),
  };

  const { data, isLoading } = useAdminUsers(filters, page);
  const toggle = useToggleUserStatus();

  // Paginator comes through ApiResponseTrait else-branch: data.data = paginator
  const paginator  = data?.data ?? {};
  const users      = paginator?.data ?? [];
  const totalPages = paginator?.last_page ?? 1;
  const total      = paginator?.total ?? 0;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleToggle = (user) => {
    if (user.id === me?.id) return;
    toggle.mutate(user.id, {
      onSuccess: () => toast.success(
        user.is_active
          ? (lang === 'ar' ? 'تم تعطيل الحساب' : 'Account deactivated')
          : (lang === 'ar' ? 'تم تفعيل الحساب' : 'Account activated')
      ),
      onError: (err) => toast.error(err?.response?.data?.message ?? (lang === 'ar' ? 'حدث خطأ' : 'Error')),
    });
  };

  const selectStyle = {
    padding: '9px 12px', borderRadius: '10px', fontSize: '0.875rem',
    border: '1px solid var(--theme-border)', background: 'var(--theme-surface)',
    color: 'var(--theme-text-primary)', fontFamily: 'inherit', cursor: 'pointer',
  };

  return (
    <AdminLayout>
      <style>{`@keyframes adm-pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--theme-text-primary)', margin: 0 }}>
          {t('admin.users')}
        </h1>
        <span style={{ fontSize: '0.875rem', color: 'var(--theme-text-secondary)' }}>
          {total} {lang === 'ar' ? 'مستخدم' : 'users'}
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'flex-end' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0', flex: '1 1 220px', minWidth: '200px', maxWidth: '340px' }}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('admin.search_users')}
            style={{ flex: 1, padding: '9px 14px', borderRadius: '10px 0 0 10px', fontSize: '0.875rem', border: '1px solid var(--theme-border)', borderInlineEnd: 'none', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', fontFamily: 'inherit' }}
          />
          <button type="submit" style={{ padding: '9px 14px', borderRadius: '0 10px 10px 0', border: '1px solid var(--theme-border)', background: 'var(--theme-accent)', color: 'var(--theme-surface)', cursor: 'pointer', fontFamily: 'inherit' }}>
            {lang === 'ar' ? 'بحث' : 'Search'}
          </button>
        </form>

        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">{t('admin.filter_all')}</option>
          <option value="customer">{t('admin.role_customer')}</option>
          <option value="vendor">{t('admin.role_vendor')}</option>
          <option value="admin">{t('admin.role_admin')}</option>
        </select>

        <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">{t('admin.filter_all')}</option>
          <option value="1">{t('admin.filter_active')}</option>
          <option value="0">{t('admin.filter_inactive')}</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ height: '44px', borderRadius: '8px', background: 'var(--theme-border)', animation: 'adm-pulse 1.4s ease infinite' }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
            {t('admin.no_users')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
                  {[t('admin.col_name'), t('admin.col_email'), t('admin.col_role'), t('admin.col_status'), t('admin.col_joined'), t('admin.col_actions')].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'start', fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => {
                  const rc = ROLE_COLORS[user.role] ?? ROLE_COLORS.customer;
                  const isSelf = user.id === me?.id;
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--theme-border)', background: idx % 2 === 0 ? 'var(--theme-surface)' : 'var(--theme-bg)' }}>
                      <td style={{ padding: '11px 14px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-text-primary)', whiteSpace: 'nowrap' }}>
                        {user.name}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, background: rc.bg, color: rc.text, whiteSpace: 'nowrap' }}>
                          {t(`admin.role_${user.role}`, user.role)}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', background: user.is_active ? '#D1FAE5' : '#FEE2E2', color: user.is_active ? '#065F46' : '#991B1B' }}>
                          {user.is_active ? t('admin.user_active') : t('admin.user_inactive')}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.8125rem', color: 'var(--theme-text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(user.created_at)}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        {isSelf ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-hint)', fontStyle: 'italic' }}>
                            {t('admin.cannot_toggle_self')}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggle(user)}
                            disabled={toggle.isPending}
                            style={{
                              padding: '5px 12px', borderRadius: '8px', fontSize: '0.8125rem',
                              fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
                              border: `1.5px solid ${user.is_active ? '#EF4444' : '#10B981'}`,
                              color: user.is_active ? '#EF4444' : '#10B981',
                              background: 'none', opacity: toggle.isPending ? 0.6 : 1,
                            }}
                          >
                            {user.is_active ? t('admin.deactivate') : t('admin.activate_user')}
                          </button>
                        )}
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
