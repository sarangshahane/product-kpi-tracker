# AGENTS.md

## Agent Context: Codex AI Assistant for Product KPI Tracker (WooCommerce Plugin)

### 🔍 Summary
The **Product KPI Tracker** is a WordPress plugin designed for WooCommerce stores. It enables store owners to analyze and track essential product performance metrics—similar to Metorik. The plugin computes and visualizes key performance indicators (KPIs) such as:

- Net Revenue  
- Monthly Recurring Revenue (MRR)  
- Average Revenue Per Subscriber (ARPS)  
- Average Order Value (AOV)  
- Churn Rate  
- Refund Rate  
- Cart Abandonment Rate  

By processing WooCommerce orders, refunds, and product data, the plugin helps users gain actionable insights into the performance and health of their online store.

---

## 🧱 Development Stack

### **Frontend**
- HTML, CSS, JavaScript
- **React JS** with **Force UI** (See [Force UI README](https://github.com/brainstormforce/force-ui/blob/master/README.md))
- Tailwind CSS

### **Backend**
- PHP (WordPress standards)
- WooCommerce APIs
- WordPress action hooks & filters

---

## 📁 Directory Structure Overview

plugin-root/
├── main-plugin-file.php
├── plugin-autoloader.php # Handles autoloading, activation/deactivation, uninstall, constants, localization
├── classes/ # Core plugin classes
│ ├── class-main.php
│ ├── class-admin.php
│ └── class-public.php
├── admin/
│ ├── assets/
│ │ ├── build/ # Built JS/CSS files for admin
│ │ ├── api/ # REST API controllers/routes
│ │ ├── ajax/ # AJAX handlers, controllers, routes
│ │ ├── images/ # UI images
│ │ └── src/
│ │ ├── common/ # Shared components like navigation bar
│ │ ├── components/ # UI widgets: dashboards, formulas
│ │ ├── fields/ # Form/input components
│ │ ├── pages/ # Dashboard, Formula, Settings
│ │ └── store/ # Redux store setup, actions, reducers
├── webpack.config.js
├── tailwind.config.js
├── package.json
├── README.md
├── LICENSE
├── .gitignore
├── .editorconfig
├── .eslintrc.js
├── .prettierrc
├── .stylelintrc
├── phpcs.xml
├── phpunit.xml
└── phpstan.neon

---

## ✅ Technical Requirements

- Follow **WordPress coding standards** and security best practices.
- Utilize **WordPress REST API**, hooks, and filters for backend extensibility.
- Ensure **localization-ready** (i18n support).
- Maintain **modular architecture** for easy updates and maintenance.
- UI built in **React JS with ForceUI**, styled using Tailwind CSS.
- Backend logic developed in **PHP**, with integration and unit test coverage using PHPUnit.
- Include detailed **developer/user documentation** for setup, configuration, and troubleshooting.
- Prioritize **performance and responsiveness**, with no negative impact on WooCommerce site speed.

---

## 🤖 Agent Role Expectations

As a Codex AI agent, you will assist with:

- Code generation and refactoring for both PHP and JavaScript/React codebases.
- Ensuring compliance with WordPress and WooCommerce development standards.
- Suggesting test cases and maintaining code quality with linting/config rules.
- Creating or editing UI components using ForceUI and Tailwind CSS.
- Writing and maintaining API routes, controllers, and AJAX handlers.
- Supporting integration testing and unit testing setups.
- Enhancing the plugin’s modular structure and performance.
