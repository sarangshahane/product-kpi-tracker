/**
 * Format a number as currency
 * 
 * @param {number} value The value to format
 * @param {string} currency The currency code (default: USD)
 * @param {number} decimals Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD', decimals = 2) => {
    if (typeof value !== 'number') {
        return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};

/**
 * Format a number as percentage
 * 
 * @param {number} value The value to format
 * @param {number} decimals Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
    if (typeof value !== 'number') {
        return '0%';
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value / 100);
};

/**
 * Determine trend direction based on current and previous values
 * 
 * @param {number} current Current value
 * @param {number} previous Previous value
 * @returns {string} 'positive', 'negative', or 'neutral'
 */
export const getTrendDirection = (current, previous) => {
    if (current > previous) {
        return 'positive';
    } else if (current < previous) {
        return 'negative';
    }
    return 'neutral';
};

/**
 * Calculate percentage change between two values
 * 
 * @param {number} current Current value
 * @param {number} previous Previous value
 * @returns {string} Formatted percentage change
 */
export const calculatePercentageChange = (current, previous) => {
    if (!previous) {
        return '0%';
    }
    
    const change = ((current - previous) / previous) * 100;
    return formatPercentage(change, 1);
};
