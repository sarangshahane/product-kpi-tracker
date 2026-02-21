<?php
/**
 * Plugin Name: Product KPI Tracker
 * Description: Track and analyze key performance indicators for your WooCommerce products.
 * Author: Sarang A. Shahane
 * Author URI: https://sarangshahane.in/
 * Version: 1.0.0
 * License: GPL v2
 * Text Domain: product-kpi-tracker
 *
 * @package ProductKPITracker
 */

/**
 * Set constants
 */
define( 'PKT_FILE', __FILE__ );
define( 'PKT_BASE', plugin_basename( PKT_FILE ) );
define( 'PKT_DIR', plugin_dir_path( PKT_FILE ) );
define( 'PKT_URL', plugins_url( '/', PKT_FILE ) );
define( 'PKT_VER', '1.0.0' );

require_once 'plugin-loader.php';

/**
 * Plugin activation: schedule nightly KPI cache rebuild and weekly email report.
 */
function pkt_activate() {
	if ( ! wp_next_scheduled( 'pkt_nightly_sync' ) ) {
		wp_schedule_event(
			strtotime( 'tomorrow midnight' ),
			'daily',
			'pkt_nightly_sync'
		);
	}

	// Schedule weekly email every Monday at 08:00 site time (AD-9).
	if ( ! wp_next_scheduled( 'pkt_weekly_email' ) ) {
		wp_schedule_event(
			strtotime( 'next monday 08:00' ),
			'weekly',
			'pkt_weekly_email'
		);
	}
}
register_activation_hook( PKT_FILE, 'pkt_activate' );

/**
 * Plugin deactivation: remove cron events.
 */
function pkt_deactivate() {
	wp_clear_scheduled_hook( 'pkt_nightly_sync' );
	wp_clear_scheduled_hook( 'pkt_weekly_email' );
}
register_deactivation_hook( PKT_FILE, 'pkt_deactivate' );
