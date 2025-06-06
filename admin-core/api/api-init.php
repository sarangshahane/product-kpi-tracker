<?php
/**
 * Initialize API endpoints.
 *
 * @package ProductKPITracker
 */

namespace PKT\AdminCore\Api;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Class Api_Init
 */
class Api_Init {

    /**
     * Instance
     *
     * @var Api_Init
     */
    private static $instance = null;

    /**
     * Get singleton instance.
     *
     * @return Api_Init
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->includes();
        add_action( 'rest_api_init', [ $this, 'register_apis' ] );
    }

    /**
     * Include required files.
     *
     * @return void
     */
    private function includes() {
        require_once PKT_DIR . 'admin-core/api/api-base.php';
        require_once PKT_DIR . 'includes/class-kpi-helper.php';
        require_once PKT_DIR . 'admin-core/api/dashboard.php';
    }

    /**
     * Register individual APIs.
     *
     * @return void
     */
    public function register_apis() {
        $dashboard = Dashboard::get_instance();
        $dashboard->register_routes();
    }
}

// Kick it off.
Api_Init::get_instance();
