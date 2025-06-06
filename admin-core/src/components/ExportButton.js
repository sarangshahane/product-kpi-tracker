import React, { useState } from 'react';

/**
 * ExportButton Component
 * 
 * Button for exporting dashboard data in various formats
 * 
 * @param {Object} props Component props
 * @param {Object} props.data Data to export
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} The ExportButton component
 */
const ExportButton = ({ data, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Export formats
    const exportFormats = [
        { id: 'csv', label: 'CSV', icon: 'file-csv' },
        { id: 'json', label: 'JSON', icon: 'code' },
        { id: 'pdf', label: 'PDF', icon: 'file-pdf' },
        { id: 'excel', label: 'Excel', icon: 'file-excel' },
    ];

    // Handle export click
    const handleExport = (format) => {
        switch (format) {
            case 'csv':
                exportCSV();
                break;
            case 'json':
                exportJSON();
                break;
            case 'pdf':
                exportPDF();
                break;
            case 'excel':
                exportExcel();
                break;
            default:
                console.error('Unsupported export format');
        }
        
        setIsOpen(false);
    };

    // Export as CSV
    const exportCSV = () => {
        if (!data || !data.trends) return;
        
        // Prepare CSV content
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Add headers
        const headers = ['Date'];
        Object.keys(data.trends).forEach(metric => {
            headers.push(getMetricLabel(metric));
        });
        csvContent += headers.join(',') + '\n';
        
        // Add data rows
        const firstMetric = Object.keys(data.trends)[0];
        const labels = data.trends[firstMetric].labels;
        
        labels.forEach((label, index) => {
            let row = [label];
            
            Object.keys(data.trends).forEach(metric => {
                row.push(data.trends[metric].values[index]);
            });
            
            csvContent += row.join(',') + '\n';
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `product-kpi-data-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        document.body.removeChild(link);
    };

    // Export as JSON
    const exportJSON = () => {
        if (!data) return;
        
        // Create JSON blob
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `product-kpi-data-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Export as PDF (placeholder - would require PDF library in real implementation)
    const exportPDF = () => {
        alert('PDF export would require a PDF generation library like jsPDF. This is a placeholder for the actual implementation.');
    };

    // Export as Excel (placeholder - would require Excel library in real implementation)
    const exportExcel = () => {
        alert('Excel export would require a library like SheetJS (xlsx). This is a placeholder for the actual implementation.');
    };

    // Get human-readable metric label
    const getMetricLabel = (metric) => {
        const labels = {
            netRevenue: 'Net Revenue',
            aov: 'Average Order Value',
            churnRate: 'Churn Rate',
            refundRate: 'Refund Rate',
        };
        
        return labels[metric] || metric;
    };

    return (
        <div className={`pkt-relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="pkt-inline-flex pkt-items-center pkt-px-4 pkt-py-2 pkt-border pkt-border-gray-300 pkt-rounded-md pkt-shadow-sm pkt-bg-white pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-50 pkt-focus:pkt-outline-none pkt-focus:pkt-ring-2 pkt-focus:pkt-ring-blue-500"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="pkt-h-5 pkt-w-5 pkt-mr-2 pkt-text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
            </button>

            {isOpen && (
                <div className="pkt-origin-top-right pkt-absolute pkt-right-0 pkt-mt-2 pkt-w-48 pkt-rounded-md pkt-shadow-lg pkt-bg-white pkt-ring-1 pkt-ring-black pkt-ring-opacity-5 pkt-focus:pkt-outline-none pkt-z-10">
                    <div className="pkt-py-1" role="menu" aria-orientation="vertical" aria-labelledby="export-button">
                        {exportFormats.map((format) => (
                            <button
                                key={format.id}
                                onClick={() => handleExport(format.id)}
                                className="pkt-block pkt-w-full pkt-text-left pkt-px-4 pkt-py-2 pkt-text-sm pkt-text-gray-700 hover:pkt-bg-gray-100"
                                role="menuitem"
                            >
                                <span className="pkt-flex pkt-items-center">
                                    <span className={`dashicons dashicons-${format.icon} pkt-mr-2`}></span>
                                    {format.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportButton;
