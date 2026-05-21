<?php
/**
 * Admin Loader.
 *
 * @package ProductKPITracker
 */

namespace PKT;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Class Admin_Loader
 */
class Admin_Loader {

    /**
     * Instance
     *
     * @var Admin_Loader
     */
    private static $instance = null;

    /**
     * Get singleton instance.
     *
     * @return Admin_Loader
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
        $this->load_files();
    }

    /**
     * Load required admin files.
     *
     * @return void
     */
    private function load_files() {
        require_once PKT_DIR . 'admin-core/api/api-init.php';
    }
}

// Kick it off only in admin.
if ( is_admin() ) {
    Admin_Loader::get_instance();
}
