<?php
/**
 * PKT Dashboard API.
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
 * Class DashboardApi.
 */
class DashboardApi extends ApiBase {

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'admin/dashboard';

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
     * Register API routes.
     */
    public function register_routes() {
        $namespace = $this->get_api_namespace();
        
        // Debug the full endpoint
        error_log('Registering route: ' . $namespace . $this->rest_base);

        register_rest_route(
            $namespace,
            $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'get_dashboard_data' ),
                    'permission_callback' => array( $this, 'check_permissions' ),
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
        $period = $request->get_param( 'period' );
        $compare = $request->get_param( 'compare' );
        $start_date = $request->get_param( 'start_date' );
        $end_date = $request->get_param( 'end_date' );

        // Set default date range if not provided
        if ( ! $start_date ) {
            $start_date = date( 'Y-m-d', strtotime( '-30 days' ) );
        }
        if ( ! $end_date ) {
            $end_date = date( 'Y-m-d' );
        }

        // Convert dates to DateTime objects
        $start = new \DateTime( $start_date );
        $end = new \DateTime( $end_date );

        // Calculate previous period dates for comparison
        $interval = $end->diff( $start );
        $prev_end = ( clone $start )->modify( '-1 second' );
        $prev_start = ( clone $prev_end )->sub( $interval );

        // Get current period data
        $current_data = $this->calculate_period_data( $start, $end, $period );

        $response_data = array(
            'stats' => $current_data['stats'],
            'trends' => $current_data['trends'],
        );

        // Add comparison data if requested
        if ( $compare ) {
            $previous_data = $this->calculate_period_data( $prev_start, $prev_end, $period );
            $response_data['previous'] = array(
                'stats' => $previous_data['stats'],
                'trends' => $previous_data['trends'],
            );
        }

        return rest_ensure_response( $response_data );
    }

    /**
     * Calculate period data including stats and trends.
     *
     * @param \DateTime $start Start date.
     * @param \DateTime $end End date.
     * @param string    $period Period type (daily, weekly, monthly).
     * @return array
     */
    private function calculate_period_data( $start, $end, $period ) {
        // Get orders in the date range
        $orders = $this->get_orders_in_range( $start, $end );
        
        // Calculate basic stats
        $stats = $this->calculate_stats( $orders );
        
        // Calculate trends based on period
        $trends = $this->calculate_trends( $orders, $period, $start, $end );

        return array(
            'stats' => $stats,
            'trends' => $trends,
        );
    }

    /**
     * Get orders within date range.
     *
     * @param \DateTime $start Start date.
     * @param \DateTime $end End date.
     * @return array
     */
    private function get_orders_in_range( $start, $end ) {
        $args = array(
            'status' => array( 'wc-completed', 'completed', 'processing' ),
            'date_created' => $start->format( 'Y-m-d' ) . '...' . $end->format( 'Y-m-d' ),
            'limit' => -1,
        );

        return wc_get_orders( $args );
    }

    /**
     * Calculate basic stats from orders.
     *
     * @param array $orders Array of WC_Order objects.
     * @return array
     */
    private function calculate_stats( $orders ) {
        $total_revenue = 0;
        $total_orders = count( $orders );
        $refunded_orders = 0;
        $refunded_amount = 0;

        foreach ( $orders as $order ) {
            $total_revenue += $order->get_total();
            
            if ( $order->get_total_refunded() > 0 ) {
                $refunded_orders++;
                $refunded_amount += $order->get_total_refunded();
            }
        }

        $aov = $total_orders > 0 ? $total_revenue / $total_orders : 0;
        $refund_rate = $total_orders > 0 ? ( $refunded_orders / $total_orders ) * 100 : 0;

        return array(
            'netRevenue' => $total_revenue - $refunded_amount,
            'mrr' => $this->calculate_mrr( $orders ),
            'arps' => $this->calculate_arps( $orders ),
            'aov' => $aov,
            'churnRate' => $this->calculate_churn_rate( $orders ),
            'refundRate' => $refund_rate,
            'abandonmentRate' => $this->calculate_abandonment_rate(),
        );
    }

    /**
     * Calculate trends data.
     *
     * @param array     $orders Array of WC_Order objects.
     * @param string    $period Period type.
     * @param \DateTime $start Start date.
     * @param \DateTime $end End date.
     * @return array
     */
    private function calculate_trends( $orders, $period, $start, $end ) {
        $trends = array(
            'netRevenue' => array( 'labels' => array(), 'values' => array() ),
            'aov' => array( 'labels' => array(), 'values' => array() ),
            'churnRate' => array( 'labels' => array(), 'values' => array() ),
            'refundRate' => array( 'labels' => array(), 'values' => array() ),
        );

        $interval = new \DateInterval( 'P1D' );
        if ( 'weekly' === $period ) {
            $interval = new \DateInterval( 'P1W' );
        } elseif ( 'monthly' === $period ) {
            $interval = new \DateInterval( 'P1M' );
        }

        $periods = new \DatePeriod( $start, $interval, $end );

        foreach ( $periods as $period_start ) {
            $period_end = clone $period_start;
            $period_end->add( $interval );
            
            $period_orders = $this->get_orders_in_range( $period_start, $period_end );
            $period_stats = $this->calculate_stats( $period_orders );

            $label = $period_start->format( 'Y-m-d' );
            if ( 'weekly' === $period ) {
                $label = $period_start->format( 'Y-m-d' ) . ' - ' . $period_end->format( 'Y-m-d' );
            } elseif ( 'monthly' === $period ) {
                $label = $period_start->format( 'Y-m' );
            }

            $trends['netRevenue']['labels'][] = $label;
            $trends['netRevenue']['values'][] = $period_stats['netRevenue'];

            $trends['aov']['labels'][] = $label;
            $trends['aov']['values'][] = $period_stats['aov'];

            $trends['churnRate']['labels'][] = $label;
            $trends['churnRate']['values'][] = $period_stats['churnRate'];

            $trends['refundRate']['labels'][] = $label;
            $trends['refundRate']['values'][] = $period_stats['refundRate'];
        }

        return $trends;
    }

    /**
     * Calculate Monthly Recurring Revenue.
     *
     * @param array $orders Array of WC_Order objects.
     * @return float
     */
    private function calculate_mrr( $orders ) {
        $mrr = 0;
        foreach ( $orders as $order ) {
            foreach ( $order->get_items() as $item ) {
                if ( $item->get_meta( '_subscription_recurring_amount' ) ) {
                    $mrr += $item->get_meta( '_subscription_recurring_amount' );
                }
            }
        }
        return $mrr;
    }

    /**
     * Calculate Average Revenue Per Subscription.
     *
     * @param array $orders Array of WC_Order objects.
     * @return float
     */
    private function calculate_arps( $orders ) {
        $total_subscription_revenue = 0;
        $subscription_count = 0;

        foreach ( $orders as $order ) {
            foreach ( $order->get_items() as $item ) {
                if ( $item->get_meta( '_subscription_recurring_amount' ) ) {
                    $total_subscription_revenue += $item->get_total();
                    $subscription_count++;
                }
            }
        }

        return $subscription_count > 0 ? $total_subscription_revenue / $subscription_count : 0;
    }

    /**
     * Calculate Churn Rate.
     *
     * @param array $orders Array of WC_Order objects.
     * @return float
     */
    private function calculate_churn_rate( $orders ) {
        // Implement your churn rate calculation logic here
        // This is a placeholder implementation
        return 0;
    }

    /**
     * Calculate Cart Abandonment Rate.
     *
     * @return float
     */
    private function calculate_abandonment_rate() {
        // Implement your cart abandonment rate calculation logic here
        // This is a placeholder implementation
        return 0;
    }
}

// Initialize the API.
DashboardApi::get_instance(); 