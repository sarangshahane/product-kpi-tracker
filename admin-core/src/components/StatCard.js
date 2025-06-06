import React from 'react';

/**
 * StatCard Component
 * 
 * Displays a single statistic card with title, value, and optional trend indicator
 * 
 * @param {Object} props Component props
 * @param {string} props.title The title of the stat card
 * @param {string|number} props.value The main value to display
 * @param {string} props.trend Optional trend indicator (positive, negative, or neutral)
 * @param {string} props.trendText Optional text to display with trend
 * @param {string} props.icon Optional icon class
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} The StatCard component
 */
const StatCard = ({ title, value, trend = 'neutral', trendText = '', icon = '', className = '' }) => {
    // Determine trend class
    const trendClass = {
        positive: 'pkt-text-green-600',
        negative: 'pkt-text-red-600',
        neutral: 'pkt-text-gray-600',
    }[trend] || 'pkt-text-gray-600';

    // Determine trend icon
    const trendIcon = {
        positive: '↑',
        negative: '↓',
        neutral: '→',
    }[trend] || '→';

    return (
        <div className={`pkt-bg-white pkt-rounded-lg pkt-shadow pkt-p-6 pkt-flex pkt-flex-col pkt-flex-1 ${className}`}>
            <div className="pkt-text-gray-500 pkt-text-sm pkt-font-medium pkt-mb-2">{title}</div>
            <div className="pkt-text-3xl pkt-font-bold pkt-mb-2">{value}</div>
            {trendText && (
                <div className={`pkt-text-sm pkt-mt-1 ${trendClass}`}>
                    <span className="pkt-mr-1">{trendIcon}</span>
                    {trendText}
                </div>
            )}
        </div>
    );
};

export default StatCard;
