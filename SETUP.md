# Product KPI Tracker Dashboard Setup

This document provides instructions for setting up and customizing the Product KPI Tracker Dashboard.

## Installation

1. Make sure you have WordPress 5.6+ and WooCommerce 5.0+ installed
2. Upload the plugin files to the `/wp-content/plugins/product-kpi-tracker` directory
3. Activate the plugin through the 'Plugins' screen in WordPress
4. Navigate to WooCommerce → Product KPIs Tracker to view your dashboard

## Development Setup

To set up the development environment:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Build for production:
   ```
   npm run build
   ```

## Dashboard Structure

The dashboard is built with React and uses Chart.js for data visualization. The main components are:

1. **Stat Cards** - Display key metrics at the top of the dashboard
2. **Graphs Section** - Shows detailed charts for each KPI with time period toggles

## Customizing the Dashboard

### Adding New KPIs

To add a new KPI to the dashboard:

1. Update the API endpoint in `includes/class-api.php` to include the new KPI data
2. Add the new KPI to the stat cards section in `admin-core/src/pages/Dashboard.js`
3. If needed, add a new tab for the KPI in the tabs array in the Dashboard component

### Modifying Chart Styles

Chart styles can be customized in the `admin-core/src/components/Chart.js` file. The component uses Chart.js, so you can refer to the [Chart.js documentation](https://www.chartjs.org/docs/latest/) for more customization options.

### Changing Time Periods

The dashboard supports daily, weekly, and monthly views. You can modify the time periods by updating the `PeriodToggle` component in `admin-core/src/components/PeriodToggle.js`.

## Accessibility Features

The dashboard is built with accessibility in mind:

- All interactive elements are keyboard navigable
- ARIA roles and attributes are used for screen readers
- Color contrast meets WCAG 2.1 AA standards
- Text alternatives are provided for charts

## Troubleshooting

If you encounter issues with the dashboard:

1. Check the browser console for JavaScript errors
2. Verify that the REST API endpoints are working correctly
3. Make sure Chart.js is properly loaded
4. Check that the plugin is activated and compatible with your WordPress version

For more help, please open an issue on the GitHub repository.
