# 📈 Product KPI Tracker – WooCommerce Plugin

**Product KPI Tracker** is a powerful WordPress plugin designed to monitor key performance indicators (KPIs) for WooCommerce products and stores. Gain deeper insights into your store's performance through real-time metrics such as Net Revenue, MRR, ARPS, AOV, Churn Rate, Refund Rate, and Cart Abandonment Rate—similar to Metorik.

---

## 🚀 Key Features

- Track and visualize essential WooCommerce KPIs:
  - ✅ Net Revenue
  - 📆 Monthly Recurring Revenue (MRR)
  - 👤 Average Revenue Per Subscriber (ARPS)
  - 🛒 Average Order Value (AOV)
  - 🔁 Churn Rate
  - 💸 Refund Rate
  - 🧾 Cart Abandonment Rate
- Smart dashboard with dynamic insights
- Fully modular and performance-optimized
- Clean and responsive UI with **ReactJS + ForceUI + TailwindCSS**
- WordPress REST API & AJAX support
- Complete support for internationalization and extensibility

---

## 🧱 Development Stack

- **Frontend**:  
  - HTML, CSS, JavaScript  
  - ReactJS + Redux  
  - Tailwind CSS  
  - [ForceUI](https://github.com/brainstormforce/force-ui)

- **Backend**:  
  - PHP with WordPress action hooks and filters  
  - WooCommerce API  
  - REST API, AJAX, and security hardening

---

## 📂 Plugin Directory Structure

product-kpi-tracker/
│
├── product-kpi-tracker.php # Main plugin file
├── autoloader.php # Handles autoloading, hooks, localization
│
├── classes/
│ ├── class-main.php # Core logic
│ ├── class-admin.php # Admin functionality
│ └── class-public.php # Public functionality
│
├── admin/
│ ├── assets/
│ │ ├── build/ # JS, CSS, PHP build files
│ │ ├── api/ # API routes, controllers
│ │ ├── ajax/ # AJAX routes, controllers
│ │ ├── images/ # Static images
│ │ └── src/
│ │ ├── common/ # Shared UI components (e.g., navbar)
│ │ ├── components/ # Dashboard, Formula UI
│ │ ├── fields/ # Reusable form fields
│ │ ├── pages/ # Dashboard, Formula, Settings pages
│ │ └── store/
│ │ ├── actions/ # Global AJAX actions
│ │ └── reducers/ # Redux state and reducers
│
├── webpack.config.js # Webpack config
├── tailwind.config.js # Tailwind CSS config
├── package.json # NPM packages
│
├── .gitignore # Git ignore rules
├── .editorconfig # Editor settings
├── .eslintrc.js # ESLint configuration
├── .prettierrc # Prettier code formatting
├── .stylelintrc # Stylelint config
│
├── phpcs.xml # PHP CodeSniffer
├── phpunit.xml # PHPUnit config
└── phpstan.neon # PHPStan static analysis

---

## ✅ Technical Highlights

- 🔧 **Modular Architecture** – Clean separation for easy maintenance and upgrades  
- 🔒 **Secure & Performant** – No performance overhead; adheres to WP coding standards  
- 🌍 **Localization Ready** – Fully translatable and i18n-ready  
- 🔌 **Hooks & Filters** – Extensible by other plugins and themes  
- 📊 **Dynamic UI** – Powered by React and ForceUI components  
- 🔍 **Fully Testable** – Includes unit, integration tests, and static analysis  

---

## 🧪 Testing & Quality

To maintain code reliability and performance, the plugin includes:

- ✅ PHPUnit test cases
- 🔄 Integration test coverage
- 📦 PHPStan for static analysis
- 🔍 PHPCS for code standards
- 🔧 ESLint, Stylelint, Prettier

```bash
# Run PHP Unit tests
vendor/bin/phpunit

# Static analysis
vendor/bin/phpstan analyse

# JS linting
npm run lint

## Installation
- Upload the plugin folder to /wp-content/plugins/
- Activate the plugin from the WordPress Admin Panel
- Navigate to Product KPI Tracker > Settings to begin configuration

## Documentation
Documentation includes:
- Installation instructions
- Configuration guide
- API reference
- Developer hooks and filters
- Component usage (ForceUI)
- Contribution guide

## License
- Licensed under the MIT License.

## Contributing
We welcome contributions! Please submit pull requests via GitHub and follow our coding standards.

## Acknowledgements
Built using:
- ForceUI
- ReactJS
- TailwindCSS
- WooCommerce REST API