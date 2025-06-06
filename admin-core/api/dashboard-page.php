<?php
/**
 * PKT Dashboard Page API.
 *
 * @package ProductKPITracker
 */

namespace PKT\AdminCore\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PKT\AdminCore\Api\ApiBase;
use PKT\KPI_Helper;

/**
 * Class Admin_Query.
 */
class DashboardPage extends ApiBase {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = '/admin/dashboard/';

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
	 * Init Hooks.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_routes() {

		$namespace = $this->get_api_namespace();

		register_rest_route(
			$namespace,
			$this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'get_dashboard_data' ],
					'permission_callback' => [ $this, 'check_permissions' ],
					'args'                => array(
                        'period' => array(
                            'type'              => 'string',
                            'default'           => 'monthly',
                            'sanitize_callback' => 'sanitize_text_field',
                            'validate_callback' => function( $param ) {
                                return in_array( $param, array( 'daily', 'weekly', 'monthly' ), true );
                            },
                        ),
                        'compare' => array(
                            'type'              => 'boolean',
                            'default'           => false,
                            'sanitize_callback' => 'rest_sanitize_boolean',
                        ),
                        'start_date' => array(
                            'type'              => 'string',
                            'format'            => 'date',
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                        'end_date' => array(
                            'type'              => 'string',
                            'format'            => 'date',
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                    ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
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
     * Get dashboard data.
     *
     * @param \WP_REST_Request $request Request object.
     * @return \WP_REST_Response
     */
    public function get_dashboard_data( $request ) {
        // Get time period from request (daily, weekly, monthly)
        $period = $request->get_param( 'period' ) ? $request->get_param( 'period' ) : 'monthly';

        // Get comparison flag
        $compare_previous = $request->get_param( 'compare' ) ? filter_var( $request->get_param( 'compare' ), FILTER_VALIDATE_BOOLEAN ) : false;

        // Get date range if provided
        $start_date = $request->get_param( 'start_date' );
        $end_date   = $request->get_param( 'end_date' );

        $start = $start_date ? new \DateTime( $start_date ) : new \DateTime( '-30 days' );
        $end   = $end_date ? new \DateTime( $end_date ) : new \DateTime();

        $interval = $end->diff( $start );
        $prev_end   = ( clone $start )->modify( '-1 second' );
        $prev_start = ( clone $prev_end )->sub( $interval );
        $pre_prev_end   = ( clone $prev_start )->modify( '-1 second' );
        $pre_prev_start = ( clone $pre_prev_end )->sub( $interval );

        $pre_previous = KPI_Helper::calculate_period_kpis( $pre_prev_start, $pre_prev_end );
        $previous     = KPI_Helper::calculate_period_kpis( $prev_start, $prev_end, $pre_previous['customers'] );
        $current      = KPI_Helper::calculate_period_kpis( $start, $end, $previous['customers'] );

        $data = [
            'stats'  => $current['stats'],
            'trends' => KPI_Helper::get_trend_data( $period, $start, $end ),
        ];

        // Add previous period data for comparison if requested
        if ( $compare_previous ) {
            $data['previous'] = [
                'stats'  => $previous['stats'],
                'trends' => KPI_Helper::get_trend_data( $period, $prev_start, $prev_end ),
            ];
        }

        return rest_ensure_response( $data );
    }
}
