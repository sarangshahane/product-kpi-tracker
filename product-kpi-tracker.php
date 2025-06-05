<?php
/**
 * Plugin Name: Product KPI Tracker
 * Description: Track and analyze key performance indicators for your WooCommerce products.
 * Author: Your Company Name
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
