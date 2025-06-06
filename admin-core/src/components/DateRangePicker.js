import React, { useState } from 'react';

/**
 * DateRangePicker Component
 * 
 * A date range picker component for selecting custom date ranges
 * 
 * @param {Object} props Component props
 * @param {Function} props.onRangeChange Callback when date range changes
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} The DateRangePicker component
 */
const DateRangePicker = ({ onRangeChange, className = '' }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Predefined date ranges
    const predefinedRanges = [
        { label: 'Last 7 days', days: 7 },
        { label: 'Last 30 days', days: 30 },
        { label: 'Last 90 days', days: 90 },
        { label: 'Year to date', type: 'ytd' },
        { label: 'Custom range', type: 'custom' }
    ];

    // Handle predefined range selection
    const handlePredefinedRange = (range) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (range.type === 'ytd') {
            // Year to date
            start = new Date(today.getFullYear(), 0, 1); // January 1st of current year
        } else if (range.type === 'custom') {
            // Keep current selection for custom range
            setIsOpen(true);
            return;
        } else {
            // Days based range
            start.setDate(today.getDate() - range.days);
        }

        const formattedStart = formatDate(start);
        const formattedEnd = formatDate(end);

        setStartDate(formattedStart);
        setEndDate(formattedEnd);
        setIsOpen(false);

        if (onRangeChange) {
            onRangeChange({
                startDate: formattedStart,
                endDate: formattedEnd,
                label: range.label
            });
        }
    };

    // Handle custom range apply
    const handleApplyCustomRange = () => {
        if (startDate && endDate) {
            setIsOpen(false);
            
            if (onRangeChange) {
                onRangeChange({
                    startDate,
                    endDate,
                    label: `${startDate} - ${endDate}`
                });
            }
        }
    };

    // Format date as YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className={`pkt-relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="pkt-flex pkt-items-center pkt-px-4 pkt-py-2 pkt-bg-white pkt-border pkt-border-gray-300 pkt-rounded-md pkt-shadow-sm pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-50 pkt-focus:pkt-outline-none pkt-focus:pkt-ring-2 pkt-focus:pkt-ring-blue-500"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="pkt-h-5 pkt-w-5 pkt-mr-2 pkt-text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {startDate && endDate ? `${startDate} - ${endDate}` : 'Select date range'}
            </button>

            {isOpen && (
                <div className="pkt-absolute pkt-z-10 pkt-mt-1 pkt-w-72 pkt-bg-white pkt-rounded-md pkt-shadow-lg pkt-p-4">
                    <div className="pkt-mb-4">
                        <h4 className="pkt-text-sm pkt-font-medium pkt-text-gray-700 pkt-mb-2">Predefined ranges</h4>
                        <div className="pkt-space-y-2">
                            {predefinedRanges.map((range) => (
                                <button
                                    key={range.label}
                                    type="button"
                                    className="pkt-block pkt-w-full pkt-text-left pkt-px-3 pkt-py-2 pkt-text-sm pkt-text-gray-700 hover:pkt-bg-gray-100 pkt-rounded-md"
                                    onClick={() => handlePredefinedRange(range)}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pkt-mb-4">
                        <h4 className="pkt-text-sm pkt-font-medium pkt-text-gray-700 pkt-mb-2">Custom range</h4>
                        <div className="pkt-grid pkt-grid-cols-2 pkt-gap-2">
                            <div>
                                <label htmlFor="start-date" className="pkt-block pkt-text-xs pkt-text-gray-500">Start date</label>
                                <input
                                    type="date"
                                    id="start-date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="pkt-mt-1 pkt-block pkt-w-full pkt-border pkt-border-gray-300 pkt-rounded-md pkt-shadow-sm pkt-text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="pkt-block pkt-text-xs pkt-text-gray-500">End date</label>
                                <input
                                    type="date"
                                    id="end-date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pkt-mt-1 pkt-block pkt-w-full pkt-border pkt-border-gray-300 pkt-rounded-md pkt-shadow-sm pkt-text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pkt-flex pkt-justify-end pkt-space-x-2">
                        <button
                            type="button"
                            className="pkt-px-3 pkt-py-2 pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-100 pkt-rounded-md"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="pkt-px-3 pkt-py-2 pkt-text-sm pkt-font-medium pkt-text-white pkt-bg-blue-600 hover:pkt-bg-blue-700 pkt-rounded-md pkt-focus:pkt-outline-none pkt-focus:pkt-ring-2 pkt-focus:pkt-ring-blue-500"
                            onClick={handleApplyCustomRange}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
