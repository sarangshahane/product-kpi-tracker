<?php
/**
 * PKT API Init.
 *
 * @package ProductKPITracker
 */

namespace PKT\AdminCore\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers all REST API controllers for the plugin.
 */
class ApiInit {

	/**
	 * Instance
	 *
	 * @access private
	 * @var object Class object.
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
		$this->initialize_hooks();
	}

	/**
	 * Init Hooks.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function initialize_hooks() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register API routes for all controllers.
	 */
	public function register_routes() {
		$controllers = array(
			'PKT\AdminCore\Api\DashboardPage',
			'PKT\AdminCore\Api\SyncApi',
			'PKT\AdminCore\Api\SettingsApi',
			'PKT\AdminCore\Api\FormulasApi',
		);

		foreach ( $controllers as $controller ) {
			$controller::get_instance()->register_routes();
		}
	}
}
