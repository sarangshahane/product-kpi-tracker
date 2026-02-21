# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Product KPI Tracker** is a WordPress plugin that provides a React-based admin dashboard for tracking WooCommerce KPIs (Net Revenue, AOV, Churn Rate, MRR, etc.). The PHP backend exposes a REST API; the React frontend consumes it and renders charts, reports, and formula builders.

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
| `product-kpi-tracker.php` | Plugin entry: defines constants (`PKT_FILE`, `PKT_DIR`, `PKT_URL`, `PKT_VER`), bootstraps loader |
| `plugin-loader.php` | PSR-4 autoloader for the `PKT\` namespace; maps `PKT_DIR/includes/` |
| `includes/class-admin.php` | Singleton; registers admin menu (Dashboard, Reports, Formulas, Settings), enqueues the React app, passes `window.pktAdminData` (adminUrl, restUrl, nonce, pluginUrl) |
| `includes/class-api.php` | Singleton; registers 8 REST routes under `/product-kpi-tracker/v1/` — dashboard stats, reports, CRUD for formulas, and settings |

The API currently returns mock data. Real WooCommerce queries should be added to the callback methods in `class-api.php`.

### React Frontend

**Entry**: `admin-core/src/index.js` → mounts to `#product-kpi-tracker--wrapper`

**Router**: `admin-core/src/PageRoute.js` — React Router v6 with routes `/`, `/reports`, `/formulas`, `/settings`. The basename is derived from `window.pktAdminData.adminUrl`.

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
├── pages/          # Dashboard, Reports, Formulas, Settings
├── components/     # StatCard, Chart (Chart.js wrapper), TabPanel, NavigationHeader, etc.
├── fields/         # Button, Input, Select, Toggle, Table, Card, DateRangePicker
├── utils/          # api.js (fetch helpers + mock data), formatters.js (currency, %, trends)
└── common/main.css # Tailwind CSS base + custom overrides
```

### Styling

- Tailwind CSS 3 with the prefix `pkt-` to prevent conflicts with WordPress admin styles
- The `important` flag is enabled in `tailwind.config.js`
- Dark mode uses class strategy (`pkt-dark`)
- Safe-listed classes include `pkt-trend-up`, `pkt-trend-down`, `pkt-trend-neutral`, and `pkt-nav-item*`

### REST API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | KPI stats + trend chart data |
| GET | `/reports` | Sales/product report data |
| GET | `/formulas` | List custom formulas |
| POST | `/formulas` | Create formula |
| PUT | `/formulas/{id}` | Update formula |
| DELETE | `/formulas/{id}` | Delete formula |
| GET | `/settings` | Plugin settings |
| PUT | `/settings` | Update settings |

## Requirements

- WordPress 5.6+, WooCommerce 5.0+, PHP 7.4+

## Current Focus
<!-- Update this each sprint so agents know what's in progress -->
- Replacing mock API data in `includes/class-api.php` with real WooCommerce queries

## Known Gotchas
- **Mock data**: All REST endpoints in `includes/class-api.php` return hardcoded data. Real WooCommerce queries are not yet wired.
- **Tailwind prefix**: All utility classes use the `pkt-` prefix (e.g., `pkt-flex`, `pkt-text-sm`). Do not mix with unprefixed classes.
- **Webpack aliases**: `@Admin`, `@Components`, `@Fields`, `@Pages`, `@Utils` are configured in `webpack.config.js` only — not in Jest. Add `moduleNameMapper` to `jest.config.js` if writing unit tests that import via these aliases.
- **`settings.local.json`** is gitignored — each developer maintains their own local overrides in `.claude/settings.local.json`.

## Team Conventions
- Commit prefix: `:hammer:` refactor, `:pencil:` docs, `:bug:` fix, `:sparkles:` feature
- Branch naming: `feature/<slug>`, `fix/<slug>`
- PR target: `master` branch
