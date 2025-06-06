/**
 * Utility functions for formatting data in the Product KPI Tracker
 */

/**
 * Format a number as currency
 * 
 * @param {number} value - The value to format
 * @param {string} currency - The currency code (default: USD)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD', decimals = 2) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return formatter.format(value);
};

/**
 * Format a number as a percentage
 * 
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a date
 * 
 * @param {Date|string} date - The date to format
 * @param {string} format - The format to use (default: 'MM/DD/YYYY')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`;
  }
};

/**
 * Format a number with thousands separators
 * 
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a trend value with an arrow indicator
 * 
 * @param {number} value - The trend value
 * @param {boolean} inverse - Whether higher values are bad (default: false)
 * @returns {Object} - Object with formatted value and CSS class
 */
export const formatTrend = (value, inverse = false) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  // Determine if the trend is good or bad
  const isGood = isNeutral ? false : inverse ? !isPositive : isPositive;
  
  return {
    value: `${isPositive ? '+' : ''}${value.toFixed(1)}%`,
    className: isNeutral ? 'pkt-trend-neutral' : (isGood ? 'pkt-trend-up' : 'pkt-trend-down'),
    icon: isNeutral ? '→' : (isPositive ? '↑' : '↓')
  };
};
