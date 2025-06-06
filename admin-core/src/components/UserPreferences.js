import React, { useState, useEffect } from 'react';

/**
 * UserPreferences Component
 * 
 * Allows users to set their dashboard preferences
 * 
 * @param {Object} props Component props
 * @param {Function} props.onSave Callback when preferences are saved
 * @param {Object} props.defaultPreferences Default preferences
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} The UserPreferences component
 */
const UserPreferences = ({ onSave, defaultPreferences = {}, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [preferences, setPreferences] = useState({
        defaultPeriod: 'monthly',
        defaultCurrency: 'USD',
        showComparison: true,
        defaultMetrics: ['netRevenue', 'aov', 'churnRate', 'refundRate'],
        ...defaultPreferences
    });

    // Available periods
    const periods = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
    ];

    // Available currencies
    const currencies = [
        { id: 'USD', label: 'US Dollar ($)' },
        { id: 'EUR', label: 'Euro (€)' },
        { id: 'GBP', label: 'British Pound (£)' },
        { id: 'JPY', label: 'Japanese Yen (¥)' },
        { id: 'CAD', label: 'Canadian Dollar (C$)' },
        { id: 'AUD', label: 'Australian Dollar (A$)' },
    ];

    // Available metrics
    const metrics = [
        { id: 'netRevenue', label: 'Net Revenue' },
        { id: 'mrr', label: 'Monthly Recurring Revenue' },
        { id: 'arps', label: 'Average Revenue Per Subscription' },
        { id: 'aov', label: 'Average Order Value' },
        { id: 'churnRate', label: 'Churn Rate' },
        { id: 'refundRate', label: 'Refund Rate' },
        { id: 'abandonmentRate', label: 'Cart Abandonment Rate' },
    ];

    // Handle preference change
    const handleChange = (key, value) => {
        setPreferences({
            ...preferences,
            [key]: value
        });
    };

    // Handle metric toggle
    const handleMetricToggle = (metricId) => {
        const currentMetrics = [...preferences.defaultMetrics];
        
        if (currentMetrics.includes(metricId)) {
            // Don't allow removing if it would result in less than 1 metric
            if (currentMetrics.length > 1) {
                handleChange('defaultMetrics', currentMetrics.filter(id => id !== metricId));
            }
        } else {
            // Don't allow adding more than 4 metrics
            if (currentMetrics.length < 4) {
                handleChange('defaultMetrics', [...currentMetrics, metricId]);
            }
        }
    };

    // Save preferences
    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem('pktUserPreferences', JSON.stringify(preferences));
        
        // Call onSave callback
        if (onSave) {
            onSave(preferences);
        }
        
        setIsOpen(false);
    };

    // Load preferences from localStorage on mount
    useEffect(() => {
        const savedPreferences = localStorage.getItem('pktUserPreferences');
        
        if (savedPreferences) {
            try {
                const parsedPreferences = JSON.parse(savedPreferences);
                setPreferences({
                    ...preferences,
                    ...parsedPreferences
                });
                
                // Call onSave to update parent component
                if (onSave) {
                    onSave(parsedPreferences);
                }
            } catch (error) {
                console.error('Error parsing saved preferences:', error);
            }
        }
    }, []);

    return (
        <div className={`pkt-relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="pkt-inline-flex pkt-items-center pkt-px-4 pkt-py-2 pkt-border pkt-border-gray-300 pkt-rounded-md pkt-shadow-sm pkt-bg-white pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-50 pkt-focus:pkt-outline-none pkt-focus:pkt-ring-2 pkt-focus:pkt-ring-blue-500"
                aria-expanded={isOpen}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="pkt-h-5 pkt-w-5 pkt-mr-2 pkt-text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Preferences
            </button>

            {isOpen && (
                <div className="pkt-absolute pkt-right-0 pkt-mt-2 pkt-w-80 pkt-bg-white pkt-rounded-md pkt-shadow-lg pkt-p-4 pkt-z-10">
                    <h3 className="pkt-text-lg pkt-font-medium pkt-text-gray-900 pkt-mb-4">Dashboard Preferences</h3>
                    
                    <div className="pkt-mb-4">
                        <label className="pkt-block pkt-text-sm pkt-font-medium pkt-text-gray-700 pkt-mb-1">
                            Default Time Period
                        </label>
                        <select
                            value={preferences.defaultPeriod}
                            onChange={(e) => handleChange('defaultPeriod', e.target.value)}
                            className="pkt-block pkt-w-full pkt-rounded-md pkt-border-gray-300 pkt-shadow-sm pkt-focus:pkt-border-blue-500 pkt-focus:pkt-ring-blue-500 pkt-text-sm"
                        >
                            {periods.map((period) => (
                                <option key={period.id} value={period.id}>
                                    {period.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="pkt-mb-4">
                        <label className="pkt-block pkt-text-sm pkt-font-medium pkt-text-gray-700 pkt-mb-1">
                            Default Currency
                        </label>
                        <select
                            value={preferences.defaultCurrency}
                            onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                            className="pkt-block pkt-w-full pkt-rounded-md pkt-border-gray-300 pkt-shadow-sm pkt-focus:pkt-border-blue-500 pkt-focus:pkt-ring-blue-500 pkt-text-sm"
                        >
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.id}>
                                    {currency.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="pkt-mb-4">
                        <div className="pkt-flex pkt-items-center">
                            <input
                                id="show-comparison"
                                type="checkbox"
                                checked={preferences.showComparison}
                                onChange={(e) => handleChange('showComparison', e.target.checked)}
                                className="pkt-h-4 pkt-w-4 pkt-text-blue-600 pkt-focus:pkt-ring-blue-500 pkt-border-gray-300 pkt-rounded"
                            />
                            <label htmlFor="show-comparison" className="pkt-ml-2 pkt-block pkt-text-sm pkt-text-gray-700">
                                Show comparison to previous period
                            </label>
                        </div>
                    </div>
                    
                    <div className="pkt-mb-4">
                        <label className="pkt-block pkt-text-sm pkt-font-medium pkt-text-gray-700 pkt-mb-1">
                            Default Dashboard Metrics (max 4)
                        </label>
                        <div className="pkt-space-y-2 pkt-mt-2">
                            {metrics.map((metric) => (
                                <div key={metric.id} className="pkt-flex pkt-items-center">
                                    <input
                                        id={`metric-${metric.id}`}
                                        type="checkbox"
                                        checked={preferences.defaultMetrics.includes(metric.id)}
                                        onChange={() => handleMetricToggle(metric.id)}
                                        className="pkt-h-4 pkt-w-4 pkt-text-blue-600 pkt-focus:pkt-ring-blue-500 pkt-border-gray-300 pkt-rounded"
                                    />
                                    <label htmlFor={`metric-${metric.id}`} className="pkt-ml-2 pkt-block pkt-text-sm pkt-text-gray-700">
                                        {metric.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="pkt-flex pkt-justify-end pkt-space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="pkt-px-3 pkt-py-2 pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-100 pkt-rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="pkt-px-3 pkt-py-2 pkt-text-sm pkt-font-medium pkt-text-white pkt-bg-blue-600 hover:pkt-bg-blue-700 pkt-rounded-md pkt-focus:pkt-outline-none pkt-focus:pkt-ring-2 pkt-focus:pkt-ring-blue-500"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPreferences;
