<?php
/**
 * Plugin Name: Product KPI Tracker
 * Description: WooCommerce addon to track key product KPIs.
 * Author: Codex
 * Version: 0.1.0
 * License: GPL v2 or later
 * Text Domain: product-kpi-tracker
 *
 * @package Product_KPI_Tracker
 */

defined( 'ABSPATH' ) || exit;

define( 'PKT_FILE', __FILE__ );
define( 'PKT_BASE', plugin_basename( PKT_FILE ) );
define( 'PKT_DIR', plugin_dir_path( PKT_FILE ) );
define( 'PKT_URL', plugins_url( '/', PKT_FILE ) );
define( 'PKT_VER', '0.1.0' );

require_once PKT_DIR . 'includes/class-autoloader.php';

ProductKPITracker\Main::get_instance();
