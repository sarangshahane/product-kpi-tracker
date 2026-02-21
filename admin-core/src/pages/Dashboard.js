import React, { useState, useEffect, useCallback } from 'react';
import {
	StatCard,
	TabPanel,
	PeriodToggle,
	Chart,
	DateRangePicker,
	ExportButton,
	ComparisonIndicator,
	PrintableReport,
	UserPreferences,
} from '../components';
import apiFetch from '@wordpress/api-fetch';
import { formatCurrency, formatPercentage } from '../utils/formatters';

/**
 * Dashboard Component
 *
 * Main dashboard page showing KPI stats and charts.
 * Fetches real data from GET pkt/v1/dashboard via @wordpress/api-fetch.
 *
 * @return {JSX.Element} The Dashboard component
 */
const Dashboard = () => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ isSyncing, setIsSyncing ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ period, setPeriod ] = useState( 'monthly' );
	const [ showComparison, setShowComparison ] = useState( false );
	const [ dateRange, setDateRange ] = useState( null );
	const [ dashboardData, setDashboardData ] = useState( {
		stats: {
			netRevenue: 0,
			mrr: 0,
			arps: 0,
			aov: 0,
			ltv: 0,
			churnRate: 0,
			refundRate: 0,
			abandonmentRate: 0,
		},
		trends: {
			netRevenue: { labels: [], values: [] },
			aov: { labels: [], values: [] },
			churnRate: { labels: [], values: [] },
			refundRate: { labels: [], values: [] },
		},
	} );

	const calculatePercentageChange = ( current, previous ) => {
		if ( ! previous || previous === 0 ) {
			return 0;
		}
		return ( ( current - previous ) / previous ) * 100;
	};

	const loadDashboardData = useCallback( ( forceRefresh = false ) => {
		setIsLoading( true );
		setError( null );

		const params = new URLSearchParams( {
			period: period || 'monthly',
			compare: showComparison ? '1' : '0',
			start_date: dateRange?.startDate || '',
			end_date: dateRange?.endDate || '',
			...( forceRefresh ? { force_refresh: '1' } : {} ),
		} );

		apiFetch( { path: `/pkt/v1/dashboard?${ params.toString() }` } )
			.then( ( data ) => {
				setDashboardData( data );
				setIsLoading( false );
			} )
			.catch( ( err ) => {
				setError( 'Failed to load dashboard data. Please try again later.' );
				console.error( 'Dashboard data fetch error:', err );
				setIsLoading( false );
			} );
	}, [ period, showComparison, dateRange ] );

	// Fetch dashboard data whenever period, comparison, or date range changes.
	useEffect( () => {
		loadDashboardData( false );
	}, [ loadDashboardData ] );

	// Handle "Sync Now" — busts cache and reloads.
	const handleSyncNow = () => {
		setIsSyncing( true );

		apiFetch( { path: '/pkt/v1/sync', method: 'POST' } )
			.then( () => {
				setIsSyncing( false );
				loadDashboardData( true );
			} )
			.catch( ( err ) => {
				console.error( 'Sync error:', err );
				setIsSyncing( false );
				loadDashboardData( true );
			} );
	};

	const handlePeriodChange = ( newPeriod ) => {
		setPeriod( newPeriod );
		setDateRange( null );
	};

	const handleDateRangeChange = ( range ) => {
		setDateRange( range );
	};

	const handlePreferencesChange = ( preferences ) => {
		setPeriod( preferences.defaultPeriod );
		setShowComparison( preferences.showComparison );
	};

	const prepareChartData = ( metric, label ) => {
		const { labels, values } = dashboardData.trends[ metric ] || { labels: [], values: [] };

		const backgroundColor = {
			netRevenue: 'rgba(59, 130, 246, 0.2)',
			aov: 'rgba(16, 185, 129, 0.2)',
			churnRate: 'rgba(239, 68, 68, 0.2)',
			refundRate: 'rgba(245, 158, 11, 0.2)',
		}[ metric ] || 'rgba(107, 114, 128, 0.2)';

		const borderColor = {
			netRevenue: 'rgb(59, 130, 246)',
			aov: 'rgb(16, 185, 129)',
			churnRate: 'rgb(239, 68, 68)',
			refundRate: 'rgb(245, 158, 11)',
		}[ metric ] || 'rgb(107, 114, 128)';

		const datasets = [
			{
				label,
				data: values,
				backgroundColor,
				borderColor,
				borderWidth: 2,
				tension: 0.3,
				pointRadius: 4,
				pointBackgroundColor: borderColor,
			},
		];

		if ( showComparison && dashboardData.previous?.trends[ metric ] ) {
			const prevData = dashboardData.previous.trends[ metric ];
			datasets.push( {
				label: `Previous ${ label }`,
				data: prevData.values,
				backgroundColor: 'rgba(107, 114, 128, 0.2)',
				borderColor: 'rgb(107, 114, 128)',
				borderWidth: 2,
				tension: 0.3,
				pointRadius: 3,
				pointBackgroundColor: 'rgb(107, 114, 128)',
				borderDash: [ 5, 5 ],
			} );
		}

		return { labels, datasets };
	};

	const createTabContent = ( metric, label ) => (
		<div className="pkt-bg-white pkt-rounded-lg pkt-shadow pkt-p-6">
			<div className="pkt-flex pkt-justify-between pkt-items-center pkt-mb-6">
				<h3 className="pkt-text-lg pkt-font-medium">{ label }</h3>
				<div className="pkt-flex pkt-gap-2">
					<PeriodToggle activePeriod={ period } onChange={ handlePeriodChange } />
					<label className="pkt-inline-flex pkt-items-center pkt-ml-4">
						<input
							type="checkbox"
							checked={ showComparison }
							onChange={ ( e ) => setShowComparison( e.target.checked ) }
							className="pkt-h-4 pkt-w-4 pkt-rounded pkt-border-gray-300"
						/>
						<span className="pkt-ml-2 pkt-text-sm pkt-text-gray-700">Compare to previous period</span>
					</label>
				</div>
			</div>
			<Chart type="line" data={ prepareChartData( metric, label ) } />
		</div>
	);

	const tabs = [
		{ id: 'netRevenue', title: 'Net Revenue', content: createTabContent( 'netRevenue', 'Net Revenue' ) },
		{ id: 'aov', title: 'Avg Order Value', content: createTabContent( 'aov', 'Average Order Value' ) },
		{ id: 'churnRate', title: 'Churn Rate', content: createTabContent( 'churnRate', 'Churn Rate' ) },
		{ id: 'refundRate', title: 'Refund Rate', content: createTabContent( 'refundRate', 'Refund Rate' ) },
	];

	if ( isLoading ) {
		return (
			<div className="pkt-flex pkt-justify-center pkt-items-center pkt-h-64">
				<div className="pkt-text-lg pkt-text-gray-600">Loading dashboard data...</div>
			</div>
		);
	}

	if ( error ) {
		return (
			<div className="pkt-bg-red-50 pkt-border pkt-border-red-200 pkt-rounded-md pkt-p-4 pkt-my-4">
				<p className="pkt-text-sm pkt-text-red-700">{ error }</p>
			</div>
		);
	}

	const { stats, hasSubscriptions, subscriptionStats } = dashboardData;
	const prevStats = dashboardData.previous?.stats;

	return (
		<div className="pkt-dashboard">
			{ /* Header */ }
			<div className="pkt-flex pkt-justify-between pkt-items-center pkt-mb-6">
				<h1 className="pkt-text-2xl pkt-font-bold">Product KPIs Dashboard</h1>
				<div className="pkt-flex pkt-gap-2 pkt-items-center">
					<DateRangePicker onRangeChange={ handleDateRangeChange } />
					<button
						onClick={ handleSyncNow }
						disabled={ isSyncing }
						className="pkt-inline-flex pkt-items-center pkt-px-3 pkt-py-2 pkt-text-sm pkt-font-medium pkt-rounded-md pkt-border pkt-border-gray-300 pkt-bg-white pkt-text-gray-700 hover:pkt-bg-gray-50 disabled:pkt-opacity-50"
					>
						{ isSyncing ? 'Syncing...' : 'Sync Now' }
					</button>
					<ExportButton data={ dashboardData } />
					<PrintableReport data={ dashboardData } period={ period } />
					<UserPreferences onSave={ handlePreferencesChange } />
				</div>
			</div>

			{ /* Primary Stat Cards */ }
			<div className="pkt-grid pkt-grid-cols-1 sm:pkt-grid-cols-2 lg:pkt-grid-cols-4 pkt-gap-6 pkt-mb-8">
				<StatCard
					title="Net Revenue"
					value={ formatCurrency( stats.netRevenue ) }
					trend={ prevStats ? ( stats.netRevenue > prevStats.netRevenue ? 'positive' : 'negative' ) : 'neutral' }
					trendText={ prevStats ? `${ Math.abs( calculatePercentageChange( stats.netRevenue, prevStats.netRevenue ) ).toFixed( 1 ) }% from previous period` : '' }
				/>
				<StatCard
					title="Average Order Value"
					value={ formatCurrency( stats.aov ) }
					trend={ prevStats ? ( stats.aov > prevStats.aov ? 'positive' : 'negative' ) : 'neutral' }
					trendText={ prevStats ? `${ Math.abs( calculatePercentageChange( stats.aov, prevStats.aov ) ).toFixed( 1 ) }% from previous period` : '' }
				/>
				<StatCard
					title="Churn Rate"
					value={ formatPercentage( stats.churnRate ) }
					trend={ prevStats ? ( stats.churnRate < prevStats.churnRate ? 'positive' : 'negative' ) : 'neutral' }
					trendText={ prevStats ? `${ Math.abs( calculatePercentageChange( stats.churnRate, prevStats.churnRate ) ).toFixed( 1 ) }% from previous period` : '' }
				/>
				<StatCard
					title="Refund Rate"
					value={ formatPercentage( stats.refundRate ) }
					trend={ prevStats ? ( stats.refundRate < prevStats.refundRate ? 'positive' : 'negative' ) : 'neutral' }
					trendText={ prevStats ? `${ Math.abs( calculatePercentageChange( stats.refundRate, prevStats.refundRate ) ).toFixed( 1 ) }% from previous period` : '' }
				/>
			</div>

			{ /* Secondary Stat Cards */ }
			<div className="pkt-grid pkt-grid-cols-1 sm:pkt-grid-cols-3 pkt-gap-6 pkt-mb-8">
				<StatCard
					title="Monthly Recurring Revenue"
					value={ formatCurrency( stats.mrr ) }
					trend={ prevStats ? ( stats.mrr > prevStats.mrr ? 'positive' : 'negative' ) : 'neutral' }
					trendText={ prevStats ? `${ Math.abs( calculatePercentageChange( stats.mrr, prevStats.mrr ) ).toFixed( 1 ) }% from previous period` : '' }
				/>
				<StatCard
					title="Avg Revenue Per Subscription"
					value={ formatCurrency( stats.arps ) }
					trend={ prevStats ? ( stats.arps > prevStats.arps ? 'positive' : 'negative' ) : 'neutral' }
					trendText={ prevStats ? `${ Math.abs( calculatePercentageChange( stats.arps, prevStats.arps ) ).toFixed( 1 ) }% from previous period` : '' }
				/>
				<StatCard
					title="Cart Abandonment Rate"
					value={ formatPercentage( stats.abandonmentRate ) }
					trend={ prevStats ? ( stats.abandonmentRate < prevStats.abandonmentRate ? 'positive' : 'negative' ) : 'neutral' }
					trendText={ prevStats ? `${ Math.abs( calculatePercentageChange( stats.abandonmentRate, prevStats.abandonmentRate ) ).toFixed( 1 ) }% from previous period` : '' }
				/>
			</div>

			{ /* Subscription Metrics — only when WC Subscriptions is active */ }
			{ hasSubscriptions && subscriptionStats && (
				<div className="pkt-mb-8">
					<h2 className="pkt-text-xl pkt-font-semibold pkt-mb-4">Subscription Metrics</h2>
					<div className="pkt-grid pkt-grid-cols-1 sm:pkt-grid-cols-3 pkt-gap-6">
						<StatCard
							title="Subscription MRR"
							value={ formatCurrency( subscriptionStats.mrr ) }
							trend="neutral"
							trendText="Monthly Recurring Revenue from active subscriptions"
						/>
						<StatCard
							title="Avg Revenue Per Subscription"
							value={ formatCurrency( subscriptionStats.arps ) }
							trend="neutral"
							trendText="Average revenue across all active subscriptions"
						/>
						<StatCard
							title="Subscription Churn Rate"
							value={ formatPercentage( subscriptionStats.churnRate ) }
							trend="neutral"
							trendText="Cancelled vs total subscriptions in this period"
						/>
					</div>
				</div>
			) }

			{ /* Charts */ }
			<div className="pkt-mt-8">
				<h2 className="pkt-text-xl pkt-font-semibold pkt-mb-6">Performance Metrics</h2>
				<TabPanel tabs={ tabs } />
			</div>
		</div>
	);
};

export default Dashboard;
