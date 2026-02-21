<?php
/**
 * PKT API Base.
 *
 * @package ProductKPITracker
 */

namespace PKT\AdminCore\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Abstract base class for all PKT REST API controllers.
 */
abstract class ApiBase extends \WP_REST_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'pkt/v1';

	/**
	 * Constructor
	 *
	 * @since 1.0.0
	 */
	public function __construct() {}

	/**
	 * Get API namespace.
	 *
	 * @return string
	 */
	public function get_api_namespace() {
		return $this->namespace;
	}
}
