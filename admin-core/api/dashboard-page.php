<?php
/**
 * PKT Dashboard API endpoint.
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
use PKT\Formula_Engine;

/**
 * Dashboard data endpoint: GET pkt/v1/dashboard
 */
class DashboardPage extends ApiBase {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'dashboard';

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

		register_rest_route(
			$namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_dashboard_data' ),
					'permission_callback' => array( $this, 'check_permissions' ),
					'args'                => array(
						'period'       => array(
							'type'              => 'string',
							'default'           => 'monthly',
							'sanitize_callback' => 'sanitize_text_field',
							'validate_callback' => function ( $param ) {
								return in_array( $param, array( 'daily', 'weekly', 'monthly' ), true );
							},
						),
						'compare'      => array(
							'type'              => 'boolean',
							'default'           => false,
							'sanitize_callback' => 'rest_sanitize_boolean',
						),
						'start_date'   => array(
							'type'              => 'string',
							'format'            => 'date',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'end_date'     => array(
							'type'              => 'string',
							'format'            => 'date',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'force_refresh' => array(
							'type'              => 'boolean',
							'default'           => false,
							'sanitize_callback' => 'rest_sanitize_boolean',
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
		$period         = $request->get_param( 'period' ) ?: 'monthly';
		$compare        = rest_sanitize_boolean( $request->get_param( 'compare' ) );
		$start_date     = $request->get_param( 'start_date' );
		$end_date       = $request->get_param( 'end_date' );
		$force_refresh  = rest_sanitize_boolean( $request->get_param( 'force_refresh' ) );

		// Build cache key.
		$settings    = get_option( 'pkt_settings', array() );
		$data_source = isset( $settings['general']['dataSource'] ) ? $settings['general']['dataSource'] : 'order_stats';
		$cache_key   = "pkt_kpi_cache_{$data_source}_{$period}";

		// Return cached data if available and not forcing refresh.
		if ( ! $force_refresh ) {
			$cached = get_transient( $cache_key );
			if ( false !== $cached ) {
				// Still add comparison if needed (not cached separately).
				if ( $compare && ! isset( $cached['previous'] ) ) {
					$cached = $this->add_comparison_data( $cached, $period, $start_date, $end_date, $data_source );
				}
				return rest_ensure_response( $cached );
			}
		}

		// Compute fresh data.
		$data = $this->compute_dashboard_data( $period, $start_date, $end_date, $data_source );

		// Cache for one day (without comparison data — comparison is request-specific).
		set_transient( $cache_key, $data, DAY_IN_SECONDS );

		// Add comparison period data if requested.
		if ( $compare ) {
			$data = $this->add_comparison_data( $data, $period, $start_date, $end_date, $data_source );
		}

		return rest_ensure_response( $data );
	}

	/**
	 * Compute dashboard KPI data for a period.
	 *
	 * @param string $period      Period key (daily|weekly|monthly).
	 * @param string $start_date  Start date string (YYYY-MM-DD) or empty.
	 * @param string $end_date    End date string (YYYY-MM-DD) or empty.
	 * @param string $data_source Data source key.
	 * @return array
	 */
	private function compute_dashboard_data( $period, $start_date, $end_date, $data_source ) {
		$start = $start_date ? new \DateTime( $start_date ) : new \DateTime( '-30 days' );
		$end   = $end_date ? new \DateTime( $end_date ) : new \DateTime();

		$interval       = $end->diff( $start );
		$prev_end       = ( clone $start )->modify( '-1 second' );
		$prev_start     = ( clone $prev_end )->sub( $interval );
		$pre_prev_end   = ( clone $prev_start )->modify( '-1 second' );
		$pre_prev_start = ( clone $pre_prev_end )->sub( $interval );

		$pre_previous = KPI_Helper::calculate_period_kpis( $pre_prev_start, $pre_prev_end, array(), $data_source );
		$previous     = KPI_Helper::calculate_period_kpis( $prev_start, $prev_end, $pre_previous['customers'], $data_source );
		$current      = KPI_Helper::calculate_period_kpis( $start, $end, $previous['customers'], $data_source );

		$response = array(
			'stats'            => $current['stats'],
			'trends'           => KPI_Helper::get_trend_data( $period, $start, $end, $data_source ),
			'hasSubscriptions' => KPI_Helper::has_subscriptions(),
		);

		if ( KPI_Helper::has_subscriptions() ) {
			$response['subscriptionStats'] = KPI_Helper::calculate_subscription_stats( $start, $end );
		}

		// Evaluate custom formulas defined by the user (AD-2).
		$custom_kpis = Formula_Engine::evaluate_custom_kpis( $current['stats'] );
		if ( ! empty( $custom_kpis ) ) {
			$response['customKpis'] = $custom_kpis;
		}

		return $response;
	}

	/**
	 * Add comparison period data to response.
	 *
	 * @param array  $data        Current period data.
	 * @param string $period      Period key.
	 * @param string $start_date  Start date string.
	 * @param string $end_date    End date string.
	 * @param string $data_source Data source key.
	 * @return array
	 */
	private function add_comparison_data( $data, $period, $start_date, $end_date, $data_source ) {
		$start    = $start_date ? new \DateTime( $start_date ) : new \DateTime( '-30 days' );
		$end      = $end_date ? new \DateTime( $end_date ) : new \DateTime();
		$interval = $end->diff( $start );

		$prev_end   = ( clone $start )->modify( '-1 second' );
		$prev_start = ( clone $prev_end )->sub( $interval );

		$pre_prev_end   = ( clone $prev_start )->modify( '-1 second' );
		$pre_prev_start = ( clone $pre_prev_end )->sub( $interval );

		$pre_previous = KPI_Helper::calculate_period_kpis( $pre_prev_start, $pre_prev_end, array(), $data_source );
		$previous     = KPI_Helper::calculate_period_kpis( $prev_start, $prev_end, $pre_previous['customers'], $data_source );

		$data['previous'] = array(
			'stats'  => $previous['stats'],
			'trends' => KPI_Helper::get_trend_data( $period, $prev_start, $prev_end, $data_source ),
		);

		return $data;
	}
}
