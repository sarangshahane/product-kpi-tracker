import React, { useRef } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

/**
 * PrintableReport — renders a hidden print-friendly report and triggers window.print() (AD-7).
 *
 * Uses CSS @media print (defined in main.css) rather than swapping document.body.innerHTML.
 * Chart.js canvases are converted to PNG images before printing so they survive page layout.
 *
 * @param {Object} props
 * @param {Object} props.data   Dashboard data object.
 * @param {string} props.period Active period key (daily|weekly|monthly).
 */
const PrintableReport = ( { data, period } ) => {
	const reportRef = useRef( null );

	const periodLabel = {
		daily: 'Daily Report — Last 14 Days',
		weekly: 'Weekly Report — Last 12 Weeks',
		monthly: 'Monthly Report — Last 12 Months',
	}[ period ] || 'KPI Report';

	const currentDate = new Date().toLocaleDateString( 'en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	} );

	const handlePrint = () => {
		// Convert all Chart.js <canvas> elements to <img> tags so they render correctly in print.
		const canvases = document.querySelectorAll( '.pkt-dashboard canvas' );
		const replacements = [];

		canvases.forEach( ( canvas ) => {
			try {
				const img = document.createElement( 'img' );
				img.src = canvas.toDataURL( 'image/png' );
				img.style.maxWidth = '100%';
				canvas.parentNode.insertBefore( img, canvas );
				canvas.style.display = 'none';
				replacements.push( { canvas, img } );
			} catch ( e ) {
				// Cross-origin canvas — skip silently.
			}
		} );

		window.print();

		// Restore canvases after print dialog closes.
		replacements.forEach( ( { canvas, img } ) => {
			canvas.style.display = '';
			if ( img.parentNode ) {
				img.parentNode.removeChild( img );
			}
		} );
	};

	const stats = data?.stats || {};

	return (
		<>
			{ /* Trigger button — hidden in print via @media print in main.css */ }
			<button
				type="button"
				onClick={ handlePrint }
				className="pkt-print-hide pkt-inline-flex pkt-items-center pkt-px-4 pkt-py-2 pkt-border pkt-border-gray-300 pkt-rounded-md pkt-shadow-sm pkt-bg-white pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-50"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="pkt-h-5 pkt-w-5 pkt-mr-2 pkt-text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={ 2 }
						d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
					/>
				</svg>
				Print Report
			</button>

			{ /* Hidden summary panel rendered only in print (@media print makes it visible) */ }
			<div ref={ reportRef } className="pkt-print-only" style={ { display: 'none' } }>
				<div style={ { textAlign: 'center', marginBottom: '20px' } }>
					<h1 style={ { fontSize: '24px', marginBottom: '8px' } }>Product KPI Dashboard</h1>
					<h2 style={ { fontSize: '18px', color: '#555', marginBottom: '4px' } }>{ periodLabel }</h2>
					<p style={ { color: '#888', fontSize: '14px' } }>Generated on { currentDate }</p>
				</div>

				<div
					style={ {
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: '16px',
						marginBottom: '24px',
					} }
				>
					{ [
						{ label: 'Net Revenue', value: formatCurrency( stats.netRevenue ) },
						{ label: 'Average Order Value', value: formatCurrency( stats.aov ) },
						{ label: 'Churn Rate', value: formatPercentage( stats.churnRate ) },
						{ label: 'Refund Rate', value: formatPercentage( stats.refundRate ) },
						{ label: 'Monthly Recurring Revenue', value: formatCurrency( stats.mrr ) },
						{ label: 'Cart Abandonment Rate', value: formatPercentage( stats.abandonmentRate ) },
					].map( ( { label, value } ) => (
						<div
							key={ label }
							style={ {
								border: '1px solid #ddd',
								borderRadius: '8px',
								padding: '12px',
							} }
						>
							<div style={ { fontSize: '13px', color: '#666', marginBottom: '4px' } }>
								{ label }
							</div>
							<div style={ { fontSize: '22px', fontWeight: 'bold' } }>{ value }</div>
						</div>
					) ) }
				</div>

				<p style={ { textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '40px' } }>
					Product KPI Tracker — Confidential
				</p>
			</div>
		</>
	);
};

export default PrintableReport;
