import React from 'react';

/**
 * ComparisonIndicator Component
 * 
 * Shows a comparison between current and previous period values
 * 
 * @param {Object} props Component props
 * @param {number} props.current Current value
 * @param {number} props.previous Previous value
 * @param {boolean} props.inverted Whether higher values are worse (e.g., for churn rate)
 * @param {string} props.format Format type ('percentage', 'currency', or 'number')
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} The ComparisonIndicator component
 */
const ComparisonIndicator = ({ 
    current, 
    previous, 
    inverted = false, 
    format = 'percentage',
    className = '' 
}) => {
    // Calculate percentage change
    const calculateChange = () => {
        if (!previous) return 0;
        return ((current - previous) / previous) * 100;
    };

    const change = calculateChange();
    
    // Determine if the change is positive (good) based on the metric type
    const isPositive = inverted ? change < 0 : change > 0;
    
    // Format the change value
    const formatChange = () => {
        const absChange = Math.abs(change);
        
        if (format === 'percentage') {
            return `${absChange.toFixed(1)}%`;
        } else if (format === 'currency') {
            return `$${absChange.toFixed(2)}`;
        }
        
        return absChange.toFixed(1);
    };
    
    // No change
    if (change === 0) {
        return (
            <div className={`pkt-flex pkt-items-center pkt-text-gray-500 ${className}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="pkt-h-4 pkt-w-4 pkt-mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                <span>No change</span>
            </div>
        );
    }
    
    return (
        <div className={`pkt-flex pkt-items-center ${isPositive ? 'pkt-text-green-600' : 'pkt-text-red-600'} ${className}`}>
            {isPositive ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="pkt-h-4 pkt-w-4 pkt-mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="pkt-h-4 pkt-w-4 pkt-mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            )}
            <span>{formatChange()} {change > 0 ? 'increase' : 'decrease'}</span>
        </div>
    );
};

export default ComparisonIndicator;
