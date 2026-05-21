<?php
namespace ProductKPITracker;

defined( 'ABSPATH' ) || exit;

class Main {
    private static $instance;

    public static function get_instance() {
        if ( ! self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
    }

    public function enqueue_assets() {
        wp_register_script(
            'pkt-admin',
            PKT_URL . 'admin/assets/build/index.js',
            [ 'wp-element', 'wp-api-fetch' ],
            PKT_VER,
            true
        );
        wp_register_style(
            'pkt-admin',
            PKT_URL . 'admin/assets/build/index.css',
            [],
            PKT_VER
        );
        wp_enqueue_script( 'pkt-admin' );
        wp_enqueue_style( 'pkt-admin' );
    }

    public function register_rest_routes() {
        $controller = new API\KPI_Controller();
        $controller->register_routes();
    }
}
