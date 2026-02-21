import React, { useState, useEffect } from 'react';
import { Card, Button, Title, Toggle, Input, Select } from '../fields';
import apiFetch from '@wordpress/api-fetch';

/**
 * Settings page — 3 tabs: General, Display, Notifications.
 * GA/Facebook Pixel removed from scope (AD-8).
 * Data source selector added (AD-1).
 * Persists to wp_options via pkt/v1/settings (AD-3).
 */
const Settings = () => {
	const [ settings, setSettings ] = useState( {
		general: {
			enableTracking: true,
			dataRetentionDays: 90,
			refreshInterval: 'daily',
			dataSource: 'order_stats',
		},
		display: {
			defaultCurrency: 'USD',
			dateFormat: 'MM/DD/YYYY',
			decimalPlaces: 2,
		},
		notifications: {
			enableWeeklyReport: false,
			emailRecipients: '',
		},
	} );

	const [ isLoading, setIsLoading ] = useState( true );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveMessage, setSaveMessage ] = useState( '' );
	const [ activeTab, setActiveTab ] = useState( 'general' );

	useEffect( () => {
		apiFetch( { path: '/pkt/v1/settings' } )
			.then( ( data ) => {
				setSettings( data );
				setIsLoading( false );
			} )
			.catch( ( err ) => {
				console.error( 'Failed to load settings:', err );
				setIsLoading( false );
			} );
	}, [] );

	const handleSettingChange = ( section, key, value ) => {
		setSettings( ( prev ) => ( {
			...prev,
			[ section ]: {
				...prev[ section ],
				[ key ]: value,
			},
		} ) );
	};

	const handleSaveSettings = () => {
		setIsSaving( true );
		setSaveMessage( '' );

		apiFetch( {
			path: '/pkt/v1/settings',
			method: 'PUT',
			data: settings,
		} )
			.then( () => {
				setIsSaving( false );
				setSaveMessage( 'Settings saved successfully.' );
				setTimeout( () => setSaveMessage( '' ), 3000 );
			} )
			.catch( ( err ) => {
				console.error( 'Failed to save settings:', err );
				setIsSaving( false );
				setSaveMessage( 'Failed to save settings. Please try again.' );
			} );
	};

	const refreshIntervalOptions = [
		{ value: 'hourly', label: 'Hourly' },
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
	];

	const dataSourceOptions = [
		{ value: 'order_stats', label: 'Order Stats (direct DB — fast)' },
		{ value: 'rest_api', label: 'REST API / wc_get_orders (portable)' },
	];

	const currencyOptions = [
		{ value: 'USD', label: 'US Dollar ($)' },
		{ value: 'EUR', label: 'Euro (€)' },
		{ value: 'GBP', label: 'British Pound (£)' },
		{ value: 'JPY', label: 'Japanese Yen (¥)' },
		{ value: 'CAD', label: 'Canadian Dollar (C$)' },
	];

	const dateFormatOptions = [
		{ value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
		{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
		{ value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
	];

	const decimalPlacesOptions = [
		{ value: 0, label: '0' },
		{ value: 1, label: '1' },
		{ value: 2, label: '2' },
		{ value: 3, label: '3' },
	];

	const tabs = [ 'general', 'display', 'notifications' ];
	const tabLabels = {
		general: 'General',
		display: 'Display',
		notifications: 'Notifications',
	};

	if ( isLoading ) {
		return (
			<div className="pkt-flex pkt-justify-center pkt-items-center pkt-h-64">
				<div className="pkt-text-lg pkt-text-gray-600">Loading settings...</div>
			</div>
		);
	}

	return (
		<div className="pkt-admin-container">
			<Title text="Settings" />

			{ /* Tab navigation */ }
			<div className="pkt-flex pkt-mb-6 pkt-border-b pkt-border-gray-200">
				{ tabs.map( ( tab ) => (
					<button
						key={ tab }
						className={ `pkt-px-4 pkt-py-2 pkt-font-medium pkt-text-sm ${
							activeTab === tab
								? 'pkt-text-blue-600 pkt-border-b-2 pkt-border-blue-600'
								: 'pkt-text-gray-600 hover:pkt-text-blue-600'
						}` }
						onClick={ () => setActiveTab( tab ) }
					>
						{ tabLabels[ tab ] }
					</button>
				) ) }
			</div>

			{ /* General Tab */ }
			{ activeTab === 'general' && (
				<Card className="pkt-mb-6">
					<Title text="General Settings" level="h3" className="pkt-mb-4" />

					<div className="pkt-mb-4">
						<div className="pkt-flex pkt-items-center pkt-mb-2">
							<Toggle
								checked={ settings.general.enableTracking }
								onChange={ ( e ) => handleSettingChange( 'general', 'enableTracking', e.target.checked ) }
							/>
							<label className="pkt-ml-2">Enable KPI Tracking</label>
						</div>
						<p className="pkt-text-sm pkt-text-gray-500 pkt-ml-14">Collect and analyze product performance data</p>
					</div>

					<div className="pkt-mb-4">
						<label className="pkt-label">Data Source</label>
						<Select
							options={ dataSourceOptions }
							value={ settings.general.dataSource }
							onChange={ ( e ) => handleSettingChange( 'general', 'dataSource', e.target.value ) }
							className="pkt-w-96"
						/>
						<p className="pkt-text-sm pkt-text-gray-500 pkt-mt-1">
							Order Stats queries the wp_wc_order_stats table directly (requires WC 3.5+). REST API uses wc_get_orders().
						</p>
					</div>

					<div className="pkt-mb-4">
						<label className="pkt-label">Data Retention Period (days)</label>
						<Input
							type="number"
							value={ settings.general.dataRetentionDays }
							onChange={ ( e ) => handleSettingChange( 'general', 'dataRetentionDays', parseInt( e.target.value, 10 ) ) }
							min="1"
							max="365"
							className="pkt-w-32"
						/>
						<p className="pkt-text-sm pkt-text-gray-500 pkt-mt-1">How long to keep detailed KPI data before aggregation</p>
					</div>

					<div className="pkt-mb-4">
						<label className="pkt-label">Data Refresh Interval</label>
						<Select
							options={ refreshIntervalOptions }
							value={ settings.general.refreshInterval }
							onChange={ ( e ) => handleSettingChange( 'general', 'refreshInterval', e.target.value ) }
							className="pkt-w-64"
						/>
						<p className="pkt-text-sm pkt-text-gray-500 pkt-mt-1">How often to refresh KPI calculations</p>
					</div>
				</Card>
			) }

			{ /* Display Tab */ }
			{ activeTab === 'display' && (
				<Card className="pkt-mb-6">
					<Title text="Display Settings" level="h3" className="pkt-mb-4" />

					<div className="pkt-mb-4">
						<label className="pkt-label">Default Currency</label>
						<Select
							options={ currencyOptions }
							value={ settings.display.defaultCurrency }
							onChange={ ( e ) => handleSettingChange( 'display', 'defaultCurrency', e.target.value ) }
							className="pkt-w-64"
						/>
					</div>

					<div className="pkt-mb-4">
						<label className="pkt-label">Date Format</label>
						<Select
							options={ dateFormatOptions }
							value={ settings.display.dateFormat }
							onChange={ ( e ) => handleSettingChange( 'display', 'dateFormat', e.target.value ) }
							className="pkt-w-64"
						/>
					</div>

					<div className="pkt-mb-4">
						<label className="pkt-label">Decimal Places</label>
						<Select
							options={ decimalPlacesOptions }
							value={ settings.display.decimalPlaces }
							onChange={ ( e ) => handleSettingChange( 'display', 'decimalPlaces', parseInt( e.target.value, 10 ) ) }
							className="pkt-w-32"
						/>
						<p className="pkt-text-sm pkt-text-gray-500 pkt-mt-1">Number of decimal places in monetary values</p>
					</div>
				</Card>
			) }

			{ /* Notifications Tab */ }
			{ activeTab === 'notifications' && (
				<Card className="pkt-mb-6">
					<Title text="Notification Settings" level="h3" className="pkt-mb-4" />

					<div className="pkt-mb-4">
						<div className="pkt-flex pkt-items-center pkt-mb-2">
							<Toggle
								checked={ settings.notifications.enableWeeklyReport }
								onChange={ ( e ) => handleSettingChange( 'notifications', 'enableWeeklyReport', e.target.checked ) }
							/>
							<label className="pkt-ml-2">Enable Weekly KPI Report</label>
						</div>
						<p className="pkt-text-sm pkt-text-gray-500 pkt-ml-14">
							Send a weekly email report every Monday with your store's KPI summary
						</p>
					</div>

					<div className="pkt-mb-4">
						<label className="pkt-label">Email Recipients</label>
						<Input
							value={ settings.notifications.emailRecipients }
							onChange={ ( e ) => handleSettingChange( 'notifications', 'emailRecipients', e.target.value ) }
							placeholder="email@example.com, another@example.com"
						/>
						<p className="pkt-text-sm pkt-text-gray-500 pkt-mt-1">
							Comma-separated list. Leave empty to use the site admin email.
						</p>
					</div>
				</Card>
			) }

			{ /* Save button + feedback */ }
			<div className="pkt-flex pkt-justify-end pkt-items-center pkt-gap-4">
				{ saveMessage && (
					<span className={ `pkt-text-sm ${ saveMessage.includes( 'Failed' ) ? 'pkt-text-red-600' : 'pkt-text-green-600' }` }>
						{ saveMessage }
					</span>
				) }
				<Button
					text={ isSaving ? 'Saving...' : 'Save Settings' }
					onClick={ handleSaveSettings }
					disabled={ isSaving }
				/>
			</div>
		</div>
	);
};

export default Settings;
