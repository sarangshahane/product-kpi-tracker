# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Product KPI Tracker** is a WordPress plugin that provides a React-based admin dashboard for tracking WooCommerce KPIs (Net Revenue, AOV, Churn Rate, MRR, etc.). The PHP backend exposes a REST API under the `pkt/v1` namespace; the React frontend consumes it and renders charts, reports, and formula builders.

## Build Commands

```bash
# Install dependencies
npm install

# Development watch mode
npm start

# Production build
npm run build

# Linting & formatting
npm run lint-js
npm run lint-js:fix
npm run lint-css
npm run lint-css:fix
npm run pretty
npm run pretty:fix

# i18n
npm run i18n

# Tests
npm run test:unit
npm run test:e2e
```

PHP tooling (from project root):
```bash
composer install
composer lint        # phpcs
composer format      # phpcbf
composer phpstan     # static analysis
composer test        # phpunit
```

## Architecture

### PHP Layer

| File | Purpose |
|------|---------|
| `product-kpi-tracker.php` | Plugin entry: defines constants (`PKT_FILE`, `PKT_DIR`, `PKT_URL`, `PKT_VER`), registers activation/deactivation hooks, bootstraps loader |
| `plugin-loader.php` | PSR-4 autoloader for `PKT\` namespace; boots all includes + API + cron |
| `includes/class-admin.php` | Singleton; registers admin menu, enqueues the React app, passes `window.pktAdminData` (adminUrl, `restUrl` = `pkt/v1`, nonce, pluginUrl) |
| `includes/class-data-source.php` | Abstracts WooCommerce order fetching — `order_stats` (direct DB, WC 3.5+) or `rest_api` (`wc_get_orders()`). Both return a normalized array shape. |
| `includes/class-kpi-helper.php` | Static KPI calculation methods. Fetches orders via `Data_Source`, computes net revenue, AOV, churn, refund, abandonment, LTV. N+1 fix in `get_trend_data()`. |
| `includes/class-formula-engine.php` | PHP-only mathematical expression evaluator (no `eval()`). Tokenises → parses → evaluates with `+`, `-`, `*`, `/`, `()`, numeric literals, variable names. |
| `includes/class-email.php` | `PKT_Weekly_Report_Email` extends `WC_Email`. Sends weekly KPI summary every Monday at 08:00. |
| `includes/emails/weekly-report.php` | HTML email template for the weekly report. |
| `admin-core/api/api-base.php` | Abstract base `PKT\AdminCore\Api\ApiBase extends WP_REST_Controller`. Namespace: `pkt/v1`. |
| `admin-core/api/api-init.php` | Singleton; hooks `register_routes()` on `rest_api_init` for all 4 controllers. |
| `admin-core/api/dashboard-page.php` | `GET pkt/v1/dashboard` — transient-cached KPI stats + trends. Includes `subscriptionStats` when WC Subscriptions active, `customKpis` from formula engine. |
| `admin-core/api/sync-api.php` | `POST pkt/v1/sync` — busts all `pkt_kpi_cache_*` transients and rebuilds for all periods. |
| `admin-core/api/settings-api.php` | `GET/PUT pkt/v1/settings` — reads/writes `pkt_settings` option. |
| `admin-core/api/formulas-api.php` | CRUD for `pkt/v1/formulas` — reads/writes `pkt_formulas` option. |

### React Frontend

**Entry**: `admin-core/src/index.js` → mounts to `#product-kpi-tracker--wrapper`

**Router**: `admin-core/src/PageRoute.js` — React Router v6 with `HashRouter` and routes `/`, `/reports`, `/formulas`, `/settings`.

**Webpack aliases** (set in `webpack.config.js`):
- `@Admin` → `admin-core/src/`
- `@Components` → `admin-core/src/components/`
- `@Fields` → `admin-core/src/fields/`
- `@Pages` → `admin-core/src/pages/`
- `@Utils` → `admin-core/src/utils/`

Build output goes to `admin-core/build/admin.js` and `admin-core/build/admin.css`.

### Key Directories

```
admin-core/src/
├── pages/          # Dashboard, Reports, Formulas, Settings (all wired to real API)
├── components/     # StatCard, Chart (Chart.js), TabPanel, ExportButton (CSV only), PrintableReport, etc.
├── fields/         # Button, Input, Select, Toggle, Table, Card, DateRangePicker
├── utils/          # formatters.js (currency, %, trends)
└── common/main.css # Tailwind CSS base + @media print rules
```

### Styling

- Tailwind CSS 3 with the prefix `pkt-` to prevent conflicts with WordPress admin styles
- The `important` flag is enabled in `tailwind.config.js`
- Dark mode uses class strategy (`pkt-dark`)
- Safe-listed classes include `pkt-trend-up`, `pkt-trend-down`, `pkt-trend-neutral`, and `pkt-nav-item*`
- Print styles: `.pkt-print-hide` hides elements when printing, `.pkt-print-only` shows the summary panel

### REST API Routes

All routes are under namespace `pkt/v1`.

| Method | Path | Description | Cache |
|--------|------|-------------|-------|
| GET | `pkt/v1/dashboard` | KPI stats + trends + optional subscription/formula results | Transient `pkt_kpi_cache_{source}_{period}` |
| POST | `pkt/v1/sync` | Bust cache and rebuild for all periods | — |
| GET | `pkt/v1/formulas` | List custom formulas from `pkt_formulas` option | — |
| POST | `pkt/v1/formulas` | Create formula (ID = `time()`) | — |
| PUT | `pkt/v1/formulas/{id}` | Update formula | — |
| DELETE | `pkt/v1/formulas/{id}` | Delete formula | — |
| GET | `pkt/v1/settings` | Plugin settings from `pkt_settings` option | — |
| PUT | `pkt/v1/settings` | Update settings (busts cache on dataSource change) | — |

### WP-Cron Events

| Hook | Schedule | Callback |
|------|----------|----------|
| `pkt_nightly_sync` | Daily at midnight | `Plugin_Loader::rebuild_kpi_cache()` |
| `pkt_weekly_email` | Weekly, Monday 08:00 | `PKT_Weekly_Report_Email::send_report()` |

### Data Sources (AD-1)

Controlled by `Settings → General → Data Source`:
- **`order_stats`** (default): Direct query on `wp_wc_order_stats` table — fast, requires WC 3.5+
- **`rest_api`**: Uses `wc_get_orders()` — portable, HPOS compatible, slower

Both return a normalized order array: `[id, total, refunded, status, customer_id, billing_email, created_at]`

## Requirements

- WordPress 5.6+, WooCommerce 5.0+, PHP 7.4+
- WC 3.5+ required for `order_stats` data source
- WC Subscriptions (optional) — enables subscription stat cards on Dashboard

## Current Focus
<!-- Update this each sprint so agents know what's in progress -->
- All 10 architectural decisions (AD-1 through AD-10) implemented on branch `feature/align-with-architecture`
- Reports page still uses mock data — real WooCommerce reports queries pending

## Known Gotchas
- **HashRouter**: Uses `HashRouter` (not `BrowserRouter`) — WordPress admin has no server-side URL rewriting, so `BrowserRouter` causes 404s on page refresh.
- **Tailwind prefix**: All utility classes use the `pkt-` prefix (e.g., `pkt-flex`, `pkt-text-sm`). Do not mix with unprefixed classes.
- **Webpack aliases**: `@Admin`, `@Components`, `@Fields`, `@Pages`, `@Utils` are configured in `webpack.config.js` only — not in Jest. Add `moduleNameMapper` to `jest.config.js` if writing unit tests that import via these aliases.
- **`settings.local.json`** is gitignored — each developer maintains their own local overrides in `.claude/settings.local.json`.
- **Formula engine**: Does not use `eval()`. Unsupported characters in expressions are silently discarded (token returns 0.0). Test expressions carefully.
- **WC Subscriptions**: `subscriptionStats` only appears in dashboard API response when `class_exists('WC_Subscriptions')` is true.

## Team Conventions
- Commit prefix: `:hammer:` refactor, `:pencil:` docs, `:bug:` fix, `:sparkles:` feature
- Branch naming: `feature/<slug>`, `fix/<slug>`
- PR target: `master` branch
