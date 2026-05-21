import React from 'react';

/**
 * ExportButton — exports dashboard trend data as a CSV file (AD-6).
 *
 * Single button, no dropdown. PDF and Excel are out of scope.
 * Filename: product-kpi-data-YYYY-MM-DD.csv
 *
 * @param {Object} props
 * @param {Object} props.data      Dashboard data object from the API.
 * @param {string} props.className Additional CSS classes.
 */
const ExportButton = ( { data, className = '' } ) => {
	const metricLabels = {
		netRevenue: 'Net Revenue',
		aov: 'Average Order Value',
		churnRate: 'Churn Rate (%)',
		refundRate: 'Refund Rate (%)',
	};

	const handleExport = () => {
		if ( ! data || ! data.trends ) {
			return;
		}

		const trends = data.trends;
		const metricKeys = Object.keys( trends ).filter( ( k ) => metricLabels[ k ] );

		if ( ! metricKeys.length ) {
			return;
		}

		const firstMetric = metricKeys[ 0 ];
		const labels = trends[ firstMetric ]?.labels || [];

		// Build header row.
		const header = [ 'Date', ...metricKeys.map( ( k ) => metricLabels[ k ] || k ) ];

		// Build data rows.
		const rows = labels.map( ( label, index ) => {
			const values = metricKeys.map( ( k ) => {
				const val = trends[ k ]?.values?.[ index ];
				return val !== undefined ? val : '';
			} );
			return [ label, ...values ];
		} );

		// Assemble CSV.
		const csvLines = [ header, ...rows ].map( ( row ) =>
			row.map( ( cell ) => `"${ String( cell ).replace( /"/g, '""' ) }"` ).join( ',' )
		);
		const csvContent = csvLines.join( '\n' );

		// Trigger download.
		const blob = new Blob( [ csvContent ], { type: 'text/csv;charset=utf-8;' } );
		const url = URL.createObjectURL( blob );
		const link = document.createElement( 'a' );
		link.setAttribute( 'href', url );
		link.setAttribute(
			'download',
			`product-kpi-data-${ new Date().toISOString().split( 'T' )[ 0 ] }.csv`
		);
		document.body.appendChild( link );
		link.click();
		document.body.removeChild( link );
		URL.revokeObjectURL( url );
	};

	return (
		<button
			type="button"
			onClick={ handleExport }
			className={ `pkt-inline-flex pkt-items-center pkt-px-4 pkt-py-2 pkt-border pkt-border-gray-300 pkt-rounded-md pkt-shadow-sm pkt-bg-white pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-50 ${ className }` }
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
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
			Export CSV
		</button>
	);
};

export default ExportButton;
