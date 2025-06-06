<?php
/**
 * PKT API Init.
 *
 * @package ProductKPITracker
 */

namespace PKT\AdminCore\Api;

use PKT\AdminCore\Api\DashboardAPI;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Admin_Menu.
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
	 * Instance
	 *
	 * @access private
	 * @var string Class object.
	 * @since 1.0.0
	 */
	private $menu_slug;

	/**
	 * Constructor
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		$this->menu_slug = 'pkt';

		$this->initialize_hooks();
	}

	/**
	 * Init Hooks.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function initialize_hooks() {

		// REST API extensions init.
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register API routes.
	 */
	public function register_routes() {

		$controllers = array(
			// 'PKT\AdminCore\Api\DashboardApi',
			'PKT\AdminCore\Api\DashboardPage', // This API is sending more close to correct data.
		);

		foreach ( $controllers as $controller ) {
			$controller::get_instance()->register_routes();
		}
	}
}

ApiInit::get_instance();
