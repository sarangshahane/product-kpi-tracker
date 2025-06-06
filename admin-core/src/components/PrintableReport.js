import React, { useRef } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

/**
 * PrintableReport Component
 * 
 * Creates a printable report of dashboard data
 * 
 * @param {Object} props Component props
 * @param {Object} props.data Dashboard data
 * @param {string} props.period Current period
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} The PrintableReport component
 */
const PrintableReport = ({ data, period, className = '' }) => {
    const reportRef = useRef(null);
    
    // Print the report
    const handlePrint = () => {
        const printContent = reportRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        
        // Create print window
        document.body.innerHTML = `
            <html>
                <head>
                    <title>Product KPI Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .report-header { text-align: center; margin-bottom: 20px; }
                        .report-date { color: #666; margin-bottom: 30px; text-align: center; }
                        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
                        .stat-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
                        .stat-title { font-size: 14px; color: #666; margin-bottom: 5px; }
                        .stat-value { font-size: 24px; font-weight: bold; }
                        .chart-section { margin-top: 30px; }
                        .chart-title { font-size: 18px; margin-bottom: 10px; }
                        .chart-placeholder { height: 300px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
                        @media print {
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        ${printContent}
                    </div>
                </body>
            </html>
        `;
        
        // Print and restore original content
        window.print();
        document.body.innerHTML = originalContent;
    };
    
    // Format period for display
    const formatPeriod = () => {
        switch (period) {
            case 'daily':
                return 'Daily Report - Last 14 Days';
            case 'weekly':
                return 'Weekly Report - Last 12 Weeks';
            case 'monthly':
                return 'Monthly Report - Last 12 Months';
            default:
                return 'KPI Report';
        }
    };
    
    // Get current date
    const getCurrentDate = () => {
        const now = new Date();
        return now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
    return (
        <div className={className}>
            <button
                onClick={handlePrint}
                className="pkt-inline-flex pkt-items-center pkt-px-4 pkt-py-2 pkt-border pkt-border-gray-300 pkt-rounded-md pkt-shadow-sm pkt-bg-white pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-50 pkt-focus:pkt-outline-none pkt-focus:pkt-ring-2 pkt-focus:pkt-ring-blue-500"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="pkt-h-5 pkt-w-5 pkt-mr-2 pkt-text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Report
            </button>
            
            {/* Hidden report content that will be used for printing */}
            <div className="pkt-hidden">
                <div ref={reportRef}>
                    <div className="report-header">
                        <h1>Product KPI Dashboard</h1>
                        <h2>{formatPeriod()}</h2>
                    </div>
                    
                    <div className="report-date">
                        Generated on {getCurrentDate()}
                    </div>
                    
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-title">Net Revenue</div>
                            <div className="stat-value">{formatCurrency(data.stats.netRevenue)}</div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-title">Average Order Value</div>
                            <div className="stat-value">{formatCurrency(data.stats.aov)}</div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-title">Average Churn Rate</div>
                            <div className="stat-value">{formatPercentage(data.stats.churnRate)}</div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-title">Average Refund Rate</div>
                            <div className="stat-value">{formatPercentage(data.stats.refundRate)}</div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-title">Monthly Recurring Revenue</div>
                            <div className="stat-value">{formatCurrency(data.stats.mrr)}</div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-title">Average Revenue Per Subscription</div>
                            <div className="stat-value">{formatCurrency(data.stats.arps)}</div>
                        </div>
                    </div>
                    
                    <div className="chart-section">
                        <div className="chart-title">Net Revenue Trend</div>
                        <div className="chart-placeholder">
                            Chart data will be included in the actual implementation
                        </div>
                    </div>
                    
                    <div className="chart-section">
                        <div className="chart-title">Average Order Value Trend</div>
                        <div className="chart-placeholder">
                            Chart data will be included in the actual implementation
                        </div>
                    </div>
                    
                    <div className="footer">
                        <p>Product KPI Tracker - Confidential Business Information</p>
                        <p>© {new Date().getFullYear()} Your Company Name</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableReport;
