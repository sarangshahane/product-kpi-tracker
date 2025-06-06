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

// Include admin class if in admin area
if ( is_admin() ) {
    require_once PKT_DIR . 'includes/class-admin.php';
    require_once PKT_DIR . 'includes/class-api.php';
}
