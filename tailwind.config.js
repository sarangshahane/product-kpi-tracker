/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './admin-core/src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  // Prefix all classes to avoid conflicts with WordPress admin styles
  prefix: 'pkt-',
  // Important to prevent conflicts with WordPress admin styles
  important: true,
  // Safelist some classes that might be dynamically generated
  safelist: [
    'pkt-trend-up',
    'pkt-trend-down',
    'pkt-trend-neutral',
    'pkt-nav-item',
    'pkt-nav-item-active',
    'pkt-dark',
  ],
}
