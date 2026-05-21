<?php
/**
 * Base class for API endpoints.
 *
 * @package ProductKPITracker
 */

namespace PKT\AdminCore\Api;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Class Api_Base
 */
abstract class Api_Base {

    /**
     * Register the routes for this endpoint.
     *
     * @return void
     */
    abstract public function register_routes();
}
