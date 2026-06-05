# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Three sub-projects share this monorepo:

| Directory | Stack | Purpose |
|---|---|---|
| `boutique-api/` | Laravel 11, PHP 8.3 | REST API |
| `boutique-web/` | React 19, Vite 8, Tailwind 4 | Web frontend |
| `boutique-mobile/` | React Native | Mobile app (in progress) |

---

## boutique-api

### Commands

```bash
# First-time setup
cd boutique-api
cp .env.example .env
composer install
php artisan migrate --seed

# Full dev environment (server + queue + log tail + vite)
composer run dev

# Individual processes
php artisan serve
php artisan queue:listen --tries=1 --timeout=0

# Tests
composer test              # clears config cache first, then runs PHPUnit
php artisan test --filter TestName   # single test

# Lint (Laravel Pint)
./vendor/bin/pint
```

### Architecture

**Auth** — Laravel Sanctum (token-based, stateless). Tokens are Bearer strings stored by the client. Social auth via Laravel Socialite (Google, Facebook). The `auth:sanctum` middleware is per-route; there is no global auth.

**Response envelope** — All controllers use `ApiResponseTrait` (`app/Http/Traits/ApiResponseTrait.php`). Every response is `{success, message, data}`. Paginated collections additionally include `links` and `meta`. Use this trait in every controller.

**Roles** — Users have a `role` column: `customer`, `vendor`, `admin`. The `CheckRole` middleware (`role:vendor`, `role:admin`) enforces access.

**GenderScope** — A global Eloquent scope on `Product` (`app/Models/Scopes/GenderScope.php`) automatically hides `is_exclusive_women = true` products from guests and male users. This scope fires on **every** `Product` query including joins. When writing queries that must bypass it (admin routes), call `->withoutGlobalScope(GenderScope::class)`.

**ProductFilter** — A query-builder class (`app/Filters/ProductFilter.php`). Call `ProductFilter::fromRequest($request)` to get a filtered, sortable `Builder` ready for pagination. Handles search (bilingual), category (recursive descendants), price, size, color, material, gender, and sort.

**Checkout flow** (`app/Http/Controllers/Checkout/CheckoutController.php`) — Steps 1–11 run inside `DB::transaction()` with `lockForUpdate` on variants to prevent race conditions. Payment initiation (step 12) runs **outside** the transaction because external HTTP calls must not hold DB locks.

**Payments** — Two active methods:
- `cod` — handled by `CodService`, confirms immediately.
- `cliq` — Jordan CliQ fintech. `CliQService` creates a pending `PaymentLog` and returns a `cliq_request_id`. The webhook (`POST /api/webhooks/cliq`) is HMAC-SHA256 verified by `VerifyCliqWebhook` middleware. In local env only, `POST /api/payments/cliq/simulate/{cliqRequestId}` triggers a mock webhook.
- PayPal code is disabled; files live in `app/Disabled/`.

**Queue jobs** — All notification dispatch (order confirmed/shipped/delivered/cancelled, wishlist sale) is async via jobs. The `ReconcileStuckOrders` Artisan command (`app/Console/Commands/`) handles orders stuck in `pending` past a threshold.

**i18n (API)** — Products have bilingual fields: `name`/`name_ar`, `description`/`description_ar`, `brand`/`brand_ar`. The `SetLocale` middleware reads `Accept-Language` from requests and sets Laravel's app locale. Translation strings live in `lang/`.

### Key business rules

- Multi-vendor: every product belongs to a vendor. Order items track `vendor_id` separately for payout splitting.
- Vendor payouts: platform collects all payments. `VendorBalance` records are created per `order_item` when admin marks an order as `delivered`. Admin manually marks payouts via `PUT /api/admin/payouts/{vendor_id}/mark-paid`.
- Gender visibility: `is_exclusive_women=true` products are hidden from male users and guests via `GenderScope`. Only female accounts see them.
- Voucher types: `percentage` (% off subtotal) and `free_shipping` only. No fixed amount vouchers.
- Shipping fee: `config('boutique.shipping.default_fee')` — currently 15.00 JOD flat rate.
- PayPal is **DISABLED**. Files exist in `app/Disabled/`. Do not re-enable without explicit instruction.
- Order number format: `'ORD-' . Str::random(12)` — do not change to sequential IDs.

### Database notes

- All migrations are in `boutique-api/database/migrations/`.
- Run `php artisan migrate:fresh --seed` to reset with test data.
- Seeder creates: 1 admin (`admin@boutique.com` / `password123`), 2 vendors, 40 products, 539 variants, 2 vouchers (`WELCOME20`, `FREESHIP`).
- `product_variants` has no `size` column in the DB — size is stored as the key in the `variants_grouped` response from the API. When flattening variants on the frontend use: `Object.entries(variants_grouped).flatMap(([size, vs]) => vs.map(v => ({ ...v, size })))`.

### API response shapes

```
Products listing:  { success, message, data: [...products], links, meta }
Single product:    { success, message, data: { ...product, variants_grouped: { "S": [...], "M": [...] }, images: [...] } }
Cart:              { success, message, data: { items: [...], subtotal, item_count } }
Wishlist:          { success, message, data: { items: [...] } }
Orders:            paginated — same shape as products listing
```

---

## boutique-web

### Commands

```bash
cd boutique-web
npm install
npm run dev      # Vite dev server (default: http://localhost:5173)
npm run build
npm run lint     # ESLint
```

### Architecture

**API client** — `src/api/axios.js`. Single Axios instance pointing at `VITE_API_URL` (default `http://localhost:8000/api`). Two interceptors:
1. Request: injects `Accept-Language` from `i18n.language` or `localStorage('boutique_locale')`.
2. Response: on 401, calls `authStore.logout()` and redirects to `/login`.

**State management** — Zustand stores in `src/stores/`:
- `authStore` — `{user, token, isAuthenticated}`, token persisted to `localStorage('auth_token')`.
- `cartStore` — derived counts/subtotal from server data (`setCart(cartData)`).
- `wishlistStore` — mirror of server wishlist.
- `uiStore` — UI flags (modals, drawers, etc.).

Server state (fetching, caching) is handled entirely by **TanStack Query v5**. Do not store API response data in Zustand; Zustand is for client-only state.

**i18n** — `src/i18n/index.js`. Default language is Arabic (`ar`), fallback English. Locale persisted to `localStorage('boutique_locale')`. When the language changes, `queryClient.invalidateQueries` is called for `products`, `product`, and `categories` so bilingual names reload automatically.

**RTL** — `src/hooks/useDirection.js` derives `dir` from the current language. `App.jsx` sets `dir` on the root `<div>`. RTL-specific styles live in `src/styles/rtl.css`.

**Theme system** — `src/contexts/ThemeContext.jsx` sets `data-theme` on `document.documentElement`. Per-category themes are defined in `src/themes/categoryThemes.js` (maps slug substrings to `luxury | streetwear | warm | kids | accessories | default`). Themes use CSS custom properties (`--theme-bg`, `--theme-text-primary`, `--theme-surface`, `--theme-border`, etc.) with 600 ms transitions.

**Routing** — `src/App.jsx`. Three guard components in `src/components/routing/`:
- `AuthGuard` — redirects to `/login` if not authenticated (saves `from` in location state).
- `GuestGuard` — redirects authenticated users away from auth pages.
- `RoleGuard` — checks `user.role` from `authStore`.

Auth-layout pages (login, register, etc.) render their own full-screen layout; `Navbar` and `Footer` are hidden for paths in `AUTH_PATHS`.

**API hooks** — All data fetching lives in `src/hooks/api/`. Each hook wraps a TanStack Query call and includes `i18n.language` in the query key so language switches trigger re-fetches. Mutations live in the same files.

**Page stubs** — `src/pages/checkoutPages.jsx`, `orderPages.jsx`, `accountPages.jsx`, `adminPages.jsx` are placeholder barrel files. Real implementations replace them one by one.

### Component conventions

- All prices use `src/utils/formatPrice.js` — `formatPrice(amount, locale)` returns `"25.00 د.أ"` or `"JOD 25.00"`.
- Product names: always use `product.display_name` (bilingual field set by the backend) with fallback to `product.name_ar` or `product.name`.
- Category names: use `category.display_name` with fallback to `name_ar` / `name`.
- Do **not** call `useWishlist()` inside `ProductCard` — it is lifted to the parent page and passed as `isInWishlist` + `onWishlistToggle` props.
- Images in `ProductCard` use a `FASHION_PLACEHOLDERS` array (8 Unsplash fashion URLs) as fallback when `product.primary_image_url` is null.

### Theme rules

- Never hardcode colors — always use CSS variables: `--theme-bg`, `--theme-surface`, `--theme-border`, `--theme-accent`, `--theme-accent-hover`, `--theme-text-primary`, `--theme-text-secondary`, `--theme-text-hint`, `--theme-badge-sale`, `--theme-success`, `--theme-border-strong`.
- Primary buttons: `background: var(--theme-accent)`, `color: var(--theme-surface)`, `border-radius: 50px`.
- Inputs: `background: var(--theme-surface)`, `border: 1px solid var(--theme-border)`, focus `border-color: var(--theme-accent)`.
- Theme transition is 600 ms ease — do not override this.

### Known variant shape issue

The API returns `variants_grouped` as an object `{ "S": [...], "M": [...] }` — **not** an array. To get a flat variants array always use:

```js
Object.entries(product.variants_grouped).flatMap(([size, vs]) => vs.map(v => ({ ...v, size })))
```

Never use `Object.values().flat()` — it loses the `size` field.

### Pages still to build

In priority order:
1. `CartPage` (`src/pages/cart/CartPage.jsx`)
2. `CheckoutPage` (`src/pages/checkout/CheckoutPage.jsx`)
3. `OrderSuccessPage` (`src/pages/checkout/OrderSuccessPage.jsx`)
4. `OrderHistoryPage` (`src/pages/orders/OrderHistoryPage.jsx`)
5. `OrderDetailPage` (`src/pages/orders/OrderDetailPage.jsx`)
6. `ProfilePage` (`src/pages/account/ProfilePage.jsx`)
7. `AddressPage` (`src/pages/account/AddressPage.jsx`)
8. `WishlistPage` (`src/pages/account/WishlistPage.jsx`)
9. `VendorDashboardPage` (`src/pages/vendor/VendorDashboardPage.jsx`)
10. `AdminDashboardPage` (`src/pages/admin/AdminDashboardPage.jsx`)

### Do not do these things

- Do not add new Zustand stores for server data — use TanStack Query.
- Do not hardcode Arabic or English strings — always use `useTranslation()`.
- Do not call multiple API hooks for the same data in child components — lift to parent.
- Do not use `localStorage` or `sessionStorage` directly — use `authStore` for auth, i18n for locale.
- Do not use `Object.values(variants_grouped).flat()` — always use `Object.entries` with size injection (see above).

---

## Environment variables

**boutique-api** (`.env`):
- `APP_ENV` — set to `local` to enable the CliQ simulator route and Whoops error pages.
- `SANCTUM_STATEFUL_DOMAINS` — not used (stateless API).
- `SERVICES_CLIQ_MERCHANT_ID`, `SERVICES_CLIQ_WEBHOOK_SECRET` — CliQ credentials.
- `SERVICES_GOOGLE_*`, `SERVICES_FACEBOOK_*` — Socialite credentials.

**boutique-web** (`.env`):
- `VITE_API_URL` — API base URL (include `/api` suffix).
