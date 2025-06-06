import React from 'react';

/**
 * PeriodToggle Component
 * 
 * Toggle between different time periods (daily, weekly, monthly)
 * 
 * @param {Object} props Component props
 * @param {string} props.activePeriod The currently active period
 * @param {Function} props.onChange Callback function when period changes
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} The PeriodToggle component
 */
const PeriodToggle = ({ activePeriod, onChange, className = '' }) => {
    const periods = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
    ];

    return (
        <div className={`pkt-inline-flex pkt-rounded-md pkt-shadow-sm ${className}`} role="group" aria-label="Time period selection">
            {periods.map((period) => (
                <button
                    key={period.id}
                    type="button"
                    onClick={() => onChange(period.id)}
                    className={`pkt-px-4 pkt-py-2 pkt-text-sm pkt-font-medium pkt-focus:pkt-z-10 pkt-focus:pkt-ring-2 pkt-focus:pkt-ring-blue-500 pkt-focus:pkt-outline-none ${
                        period.id === activePeriod
                            ? 'pkt-bg-blue-600 pkt-text-white'
                            : 'pkt-bg-white pkt-text-gray-700 hover:pkt-bg-gray-50'
                    } ${
                        period.id === 'daily' ? 'pkt-rounded-l-md' : ''
                    } ${
                        period.id === 'monthly' ? 'pkt-rounded-r-md' : ''
                    }`}
                    aria-pressed={period.id === activePeriod}
                >
                    {period.label}
                </button>
            ))}
        </div>
    );
};

export default PeriodToggle;
