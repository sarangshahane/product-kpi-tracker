<?php
/**
 * PKT Formulas API endpoints.
 *
 * @package ProductKPITracker
 */

namespace PKT\AdminCore\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PKT\AdminCore\Api\ApiBase;

/**
 * Formula CRUD endpoints:
 *   GET    pkt/v1/formulas       — list all formulas
 *   POST   pkt/v1/formulas       — create formula
 *   PUT    pkt/v1/formulas/{id}  — update formula
 *   DELETE pkt/v1/formulas/{id}  — delete formula
 *
 * Formulas are stored as get_option('pkt_formulas').
 */
class FormulasApi extends ApiBase {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'formulas';

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
	 * Register REST routes.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_routes() {
		$namespace = $this->get_api_namespace();

		// Collection: GET (list) + POST (create).
		register_rest_route(
			$namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_formulas' ),
					'permission_callback' => array( $this, 'check_permissions' ),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_formula' ),
					'permission_callback' => array( $this, 'check_permissions' ),
				),
			)
		);

		// Single item: PUT (update) + DELETE.
		register_rest_route(
			$namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_formula' ),
					'permission_callback' => array( $this, 'check_permissions' ),
					'args'                => array(
						'id' => array(
							'type'              => 'integer',
							'required'          => true,
							'sanitize_callback' => 'absint',
						),
					),
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_formula' ),
					'permission_callback' => array( $this, 'check_permissions' ),
					'args'                => array(
						'id' => array(
							'type'              => 'integer',
							'required'          => true,
							'sanitize_callback' => 'absint',
						),
					),
				),
			)
		);
	}

	/**
	 * Check permissions for the request.
	 *
	 * @return bool
	 */
	public function check_permissions() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get all formulas.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_formulas( $request ) {
		$formulas = get_option( 'pkt_formulas', array() );
		return rest_ensure_response( array_values( $formulas ) );
	}

	/**
	 * Create a new formula.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function create_formula( $request ) {
		$body = $request->get_json_params();

		if ( empty( $body['name'] ) || empty( $body['formula'] ) ) {
			return new \WP_Error(
				'pkt_missing_fields',
				__( 'Formula name and expression are required.', 'product-kpi-tracker' ),
				array( 'status' => 400 )
			);
		}

		$formulas   = get_option( 'pkt_formulas', array() );
		$new_formula = $this->sanitize_formula( $body );
		$new_formula['id'] = time(); // Unix timestamp as unique ID.

		$formulas[] = $new_formula;
		update_option( 'pkt_formulas', $formulas );

		return rest_ensure_response( $new_formula );
	}

	/**
	 * Update an existing formula.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update_formula( $request ) {
		$id   = (int) $request->get_param( 'id' );
		$body = $request->get_json_params();

		$formulas = get_option( 'pkt_formulas', array() );
		$found    = false;
		$updated  = array_map(
			function ( $formula ) use ( $id, $body, &$found ) {
				if ( (int) $formula['id'] === $id ) {
					$found = true;
					return array_merge( $formula, $this->sanitize_formula( $body ), array( 'id' => $id ) );
				}
				return $formula;
			},
			$formulas
		);

		if ( ! $found ) {
			return new \WP_Error(
				'pkt_formula_not_found',
				__( 'Formula not found.', 'product-kpi-tracker' ),
				array( 'status' => 404 )
			);
		}

		update_option( 'pkt_formulas', $updated );

		$result = array_values(
			array_filter( $updated, function ( $f ) use ( $id ) {
				return (int) $f['id'] === $id;
			} )
		);

		return rest_ensure_response( $result[0] );
	}

	/**
	 * Delete a formula.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_formula( $request ) {
		$id       = (int) $request->get_param( 'id' );
		$formulas = get_option( 'pkt_formulas', array() );

		$filtered = array_values(
			array_filter( $formulas, function ( $f ) use ( $id ) {
				return (int) $f['id'] !== $id;
			} )
		);

		if ( count( $filtered ) === count( $formulas ) ) {
			return new \WP_Error(
				'pkt_formula_not_found',
				__( 'Formula not found.', 'product-kpi-tracker' ),
				array( 'status' => 404 )
			);
		}

		update_option( 'pkt_formulas', $filtered );

		return rest_ensure_response(
			array(
				'success' => true,
				'id'      => $id,
			)
		);
	}

	/**
	 * Sanitize a formula payload.
	 *
	 * @param array $data Raw formula data.
	 * @return array Sanitized formula.
	 */
	private function sanitize_formula( $data ) {
		$variables = array();
		if ( ! empty( $data['variables'] ) && is_array( $data['variables'] ) ) {
			foreach ( $data['variables'] as $var ) {
				$variables[] = array(
					'name'   => sanitize_text_field( $var['name'] ?? '' ),
					'source' => sanitize_text_field( $var['source'] ?? '' ),
				);
			}
		}

		return array(
			'name'        => sanitize_text_field( $data['name'] ?? '' ),
			'formula'     => sanitize_text_field( $data['formula'] ?? '' ),
			'description' => sanitize_textarea_field( $data['description'] ?? '' ),
			'isActive'    => isset( $data['isActive'] ) ? (bool) $data['isActive'] : true,
			'variables'   => $variables,
		);
	}
}
