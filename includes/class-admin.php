<?php
/**
 * Admin class for Product KPI Tracker
 *
 * @package ProductKPITracker
 * @since 1.0.0
 */

namespace PKT;

/**
 * Admin class to handle all admin functionality
 */
class Admin {

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
	 * Constructor
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'register_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
	}

	/**
	 * Register admin menu
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_admin_menu() {
		add_menu_page(
			__( 'Product KPI Tracker', 'product-kpi-tracker' ),
			__( 'Product KPIs', 'product-kpi-tracker' ),
			'manage_options',
			'product-kpi-tracker',
			array( $this, 'render_admin_page' ),
			'dashicons-chart-area',
			58
		);

		add_submenu_page(
			'product-kpi-tracker',
			__( 'Dashboard', 'product-kpi-tracker' ),
			__( 'Dashboard', 'product-kpi-tracker' ),
			'manage_options',
			'product-kpi-tracker',
			array( $this, 'render_admin_page' )
		);

		add_submenu_page(
			'product-kpi-tracker',
			__( 'Reports', 'product-kpi-tracker' ),
			__( 'Reports', 'product-kpi-tracker' ),
			'manage_options',
			'product-kpi-tracker&path=reports',
			array( $this, 'render_admin_page' )
		);

		add_submenu_page(
			'product-kpi-tracker',
			__( 'Formulas', 'product-kpi-tracker' ),
			__( 'Formulas', 'product-kpi-tracker' ),
			'manage_options',
			'product-kpi-tracker&path=formulas',
			array( $this, 'render_admin_page' )
		);

		add_submenu_page(
			'product-kpi-tracker',
			__( 'Settings', 'product-kpi-tracker' ),
			__( 'Settings', 'product-kpi-tracker' ),
			'manage_options',
			'product-kpi-tracker&path=settings',
			array( $this, 'render_admin_page' )
		);
	}

	/**
	 * Enqueue admin scripts
	 *
	 * @since 1.0.0
	 * @param string $hook Current admin page hook.
	 * @return void
	 */
	public function enqueue_admin_scripts( $hook ) {
		// Only load on plugin admin pages.
		if ( false === strpos( $hook, 'product-kpi-tracker' ) ) {
			return;
		}

		$build_path = 'admin-core/build/';
		// Get the asset file for dependencies and version
		$asset_file = include PKT_DIR . $build_path . 'admin.asset.php';

		// Enqueue admin styles.
		wp_enqueue_style(
			'product-kpi-tracker-admin-style',
			PKT_URL . $build_path . 'admin.css',
			array(),
			PKT_VER
		);

		// Enqueue the admin script.
		wp_enqueue_script(
			'product-kpi-tracker-admin',
			PKT_URL . $build_path. 'admin.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		// Add admin data to script.
		wp_localize_script(
			'product-kpi-tracker-admin',
			'pktAdminData',
			array(
				'adminUrl'   => admin_url( 'admin.php?page=product-kpi-tracker' ),
				'restUrl'    => rest_url( 'product-kpi-tracker/v1' ),
				'nonce'      => wp_create_nonce( 'wp_rest' ),
				'pluginUrl'  => PKT_URL,
				'pluginPath' => PKT_DIR,
			)
		);

	}

	/**
	 * Render admin page
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_admin_page() {
		?>
		<div class="wrap">
			<div id="product-kpi-tracker-admin"></div>
		</div>
		<?php
	}
}

// Initialize the admin class.
Admin::get_instance();
