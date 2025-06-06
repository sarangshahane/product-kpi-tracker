<?php
/**
 * Dashboard API.
 *
 * @package ProductKPITracker
 */

namespace PKT\AdminCore\Api;

use PKT\KPI_Helper;

use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Class Dashboard
 */
class Dashboard extends Api_Base {

    /**
     * Instance
     *
     * @var Dashboard
     */
    private static $instance = null;

    /**
     * Get singleton instance.
     *
     * @return Dashboard
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Register the routes for dashboard API.
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            'product-kpi-tracker/v1',
            '/dashboard',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_dashboard_data' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
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
