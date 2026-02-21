<?php
/**
 * Plugin Loader.
 *
 * @package ProductKPITracker
 * @since 1.0.0
 */

namespace PKT;

use PKT\AdminCore\Api\ApiInit;

/**
 * Plugin_Loader
 *
 * @since 1.0.0
 */
class Plugin_Loader {

	/**
	 * Instance
	 *
	 * @access private
	 * @var object Class Instance.
	 * @since 1.0.0
	 */
	private static $instance;

	/**
	 * Initiator
	 *
	 * @since 1.0.0
	 * @return object initialized object of class.
	 */
	public static function get_instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Autoload classes.
	 *
	 * @param string $class class name.
	 */
	public function autoload( $class ) {
		if ( 0 !== strpos( $class, __NAMESPACE__ ) ) {
			return;
		}

		$class_to_load = $class;

		$filename = strtolower(
			preg_replace(
				[ '/^' . __NAMESPACE__ . '\\\/', '/([a-z])([A-Z])/', '/_/', '/\\\/' ],
				[ '', '$1-$2', '-', DIRECTORY_SEPARATOR ],
				$class_to_load
			)
		);

		$file = PKT_DIR . $filename . '.php';

		// if the file redable, include it.
		if ( is_readable( $file ) ) {
			require_once $file;
		}
	}

	/**
	 * Constructor
	 *
	 * @since 1.0.0
	 */
	public function __construct() {

		spl_autoload_register( [ $this, 'autoload' ] );

		add_action( 'plugins_loaded', [ $this, 'load_textdomain' ] );

		$this->define_constants();
		$this->setup_classes();
	}

	/**
	 * Define additional plugin constants.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function define_constants() {
		define( 'PKT_ADMIN_CORE_DIR', PKT_DIR . 'admin-core/' );
		define( 'PKT_ADMIN_CORE_URL', PKT_URL . 'admin-core/' );
	}

	/**
	 * Load required classes and boot the API.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function setup_classes() {
		require_once PKT_DIR . 'includes/class-data-source.php';
		require_once PKT_DIR . 'includes/class-kpi-helper.php';
		require_once PKT_DIR . 'includes/class-formula-engine.php';
		require_once PKT_DIR . 'includes/class-admin.php';

		// Boot the REST API (registered on rest_api_init hook inside ApiInit).
		ApiInit::get_instance();

		// Register nightly cache rebuild cron callback.
		add_action( 'pkt_nightly_sync', array( $this, 'rebuild_kpi_cache' ) );

		// Register weekly email cron callback (AD-9).
		// class-email.php is loaded lazily here because WC_Email may not exist yet
		// at plugin load time. Loading it inside the closure guarantees WooCommerce
		// is fully initialised before the class declaration is executed.
		add_action(
			'pkt_weekly_email',
			function () {
				require_once PKT_DIR . 'includes/class-email.php';
				\PKT\PKT_Weekly_Report_Email::send_report();
			}
		);

		// Register custom WC email class so WooCommerce includes it in its mailer.
		add_filter( 'woocommerce_email_classes', array( $this, 'register_email_classes' ) );
	}

	/**
	 * Register our custom WC_Email subclass with WooCommerce's mailer.
	 *
	 * @param array $email_classes Existing WC email classes.
	 * @return array
	 */
	public function register_email_classes( $email_classes ) {
		// Load lazily: woocommerce_email_classes fires after WC is fully loaded,
		// so WC_Email is guaranteed to exist at this point.
		require_once PKT_DIR . 'includes/class-email.php';
		$email_classes['PKT_Weekly_Report'] = new \PKT\PKT_Weekly_Report_Email();
		return $email_classes;
	}

	/**
	 * Rebuild KPI cache for all periods (called by nightly cron).
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function rebuild_kpi_cache() {
		require_once PKT_DIR . 'admin-core/api/sync-api.php';
		$data_source = \PKT\Data_Source::get_active_source();
		foreach ( array( 'daily', 'weekly', 'monthly' ) as $period ) {
			\PKT\AdminCore\Api\SyncApi::rebuild_cache_for_period( $period, $data_source );
		}
	}

	/**
	 * Load Plugin Text Domain.
	 * This will load the translation textdomain depending on the file priorities.
	 *      1. Global Languages /wp-content/languages/product-kpi-tracker/ folder
	 *      2. Local dorectory /wp-content/plugins/product-kpi-tracker/languages/ folder
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function load_textdomain() {
		// Default languages directory.
		$lang_dir = PKT_DIR . 'languages/';

		/**
		 * Filters the languages directory path to use for plugin.
		 *
		 * @param string $lang_dir The languages directory path.
		 */
		$lang_dir = apply_filters( 'pkt_languages_directory', $lang_dir );

		// Traditional WordPress plugin locale filter.
		global $wp_version;

		$get_locale = get_locale();

		if ( $wp_version >= 4.7 ) {
			$get_locale = get_user_locale();
		}

		/**
		 * Language Locale for plugin
		 *
		 * @var $get_locale The locale to use.
		 * Uses get_user_locale()` in WordPress 4.7 or greater,
		 * otherwise uses `get_locale()`.
		 */
		$locale = apply_filters( 'plugin_locale', $get_locale, 'product-kpi-tracker' );
		$mofile = sprintf( '%1$s-%2$s.mo', 'product-kpi-tracker', $locale );

		// Setup paths to current locale file.
		$mofile_global = WP_LANG_DIR . '/plugins/' . $mofile;
		$mofile_local  = $lang_dir . $mofile;

		if ( file_exists( $mofile_global ) ) {
			// Look in global /wp-content/languages/product-kpi-tracker/ folder.
			load_textdomain( 'product-kpi-tracker', $mofile_global );
		} elseif ( file_exists( $mofile_local ) ) {
			// Look in local /wp-content/plugins/product-kpi-tracker/languages/ folder.
			load_textdomain( 'product-kpi-tracker', $mofile_local );
		} else {
			// Load the default language files.
			load_plugin_textdomain( 'product-kpi-tracker', false, $lang_dir );
		}
	}
}

/**
 * Kicking this off by calling 'get_instance()' method
 */
Plugin_Loader::get_instance();
