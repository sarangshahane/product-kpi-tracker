import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * ChartComponent
 * 
 * Renders a Chart.js chart with the provided data
 * 
 * @param {Object} props Component props
 * @param {string} props.type Chart type (line, bar, etc.)
 * @param {Object} props.data Chart data object
 * @param {Object} props.options Chart options
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} The Chart component
 */
const ChartComponent = ({ type = 'line', data, options = {}, className = '' }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Create new chart
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            
            // Default options for better appearance
            const defaultOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                // Format based on data type
                                if (type === 'line' && this.chart.data.datasets[0].label.includes('Rate')) {
                                    return value + '%';
                                } else if (type === 'line' && this.chart.data.datasets[0].label.includes('Revenue')) {
                                    return '$' + value.toLocaleString();
                                }
                                return value;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            };

            // Merge default options with provided options
            const mergedOptions = { ...defaultOptions, ...options };

            // Create chart instance
            chartInstance.current = new Chart(ctx, {
                type,
                data,
                options: mergedOptions,
            });
        }

        // Cleanup function
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [type, data, options]);

    return (
        <div className={`pkt-w-full pkt-h-[400px] ${className}`}>
            <canvas ref={chartRef} />
        </div>
    );
};

export default ChartComponent;
