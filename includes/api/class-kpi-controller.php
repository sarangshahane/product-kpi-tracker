<?php
namespace ProductKPITracker\API;

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use ProductKPITracker\KPI_Helper;
use WC_Admin_Report;
use WC_Order_Query;

defined( 'ABSPATH' ) || exit;

class KPI_Controller extends WP_REST_Controller {

    public function __construct() {
        $this->namespace = 'product-kpi-tracker/v1';
        $this->rest_base = 'kpis';
    }

    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_kpis' ],
                'permission_callback' => [ $this, 'permissions_check' ],
            ]
        );
    }

    public function permissions_check( $request ) {
        return current_user_can( 'manage_woocommerce' );
    }

    public function get_kpis( WP_REST_Request $request ) {
        $kpis = [
            'netRevenue'      => $this->get_net_revenue(),
            'mrr'             => $this->get_mrr(),
            'arps'            => $this->get_arps(),
            'aov'             => $this->get_aov(),
            'ltv'             => $this->get_ltv(),
            'churnRate'       => $this->get_churn_rate(),
            'refundRate'      => $this->get_refund_rate(),
            'abandonmentRate' => $this->get_cart_abandonment_rate(),
        ];

        return rest_ensure_response( $kpis );
    }

    private function get_net_revenue() {
        $revenue = $this->get_total_revenue();
        $refunds = $this->get_total_refunded();
        return round( $revenue - $refunds, 2 );
    }

    private function get_mrr() {
        $customers = $this->get_active_customers();
        if ( 0 === $customers ) {
            return 0.0;
        }
        return round( $customers * $this->get_arps(), 2 );
    }

    private function get_active_customers() {
        $orders = $this->get_orders( [
            'date_paid' => '>' . strtotime( '-30 days' ),
        ] );
        $customer_ids = [];
        foreach ( $orders as $order ) {
            $cid = $order->get_customer_id();
            if ( $cid ) {
                $customer_ids[ $cid ] = true;
            }
        }
        return count( $customer_ids );
    }

    private function get_arps() {
        $revenue   = $this->get_revenue_last_30_days();
        $customers = $this->get_active_customers();
        if ( 0 === $customers ) {
            return 0.0;
        }
        return round( $revenue / $customers, 2 );
    }

    private function get_aov() {
        $revenue = $this->get_net_revenue();
        $orders  = $this->get_order_count();
        return KPI_Helper::aov( $revenue, $orders );
    }

    private function get_order_count() {
        return count( $this->get_orders() );
    }

    private function get_ltv() {
        $orders        = $this->get_orders();
        $customer_data = [];
        foreach ( $orders as $order ) {
            $cid = $order->get_customer_id();
            if ( ! $cid ) {
                continue;
            }
            if ( ! isset( $customer_data[ $cid ] ) ) {
                $customer_data[ $cid ] = [
                    'spent'      => 0,
                    'first_date' => $order->get_date_paid( 'timestamp' ),
                    'last_date'  => $order->get_date_paid( 'timestamp' ),
                    'orders'     => 0,
                ];
            }

            $customer_data[ $cid ]['spent']     += $order->get_total();
            $customer_data[ $cid ]['orders']    += 1;
            $customer_data[ $cid ]['last_date'] = $order->get_date_paid( 'timestamp' );
        }

        $ltv = 0.0;
        $count = count( $customer_data );
        if ( 0 === $count ) {
            return $ltv;
        }

        foreach ( $customer_data as $stats ) {
            $lifespan_days = max( 1, $stats['last_date'] - $stats['first_date'] ) / DAY_IN_SECONDS;
            $frequency     = $stats['orders'];
            $avg_value     = KPI_Helper::aov( $stats['spent'], $stats['orders'] );
            $ltv          += $avg_value * $frequency * ( $lifespan_days / 30 );
        }

        return round( $ltv / $count, 2 );
    }

    private function get_churn_rate() {
        $current_customers = $this->get_customer_ids_in_range( '-30 days', 'now' );
        $previous_customers = $this->get_customer_ids_in_range( '-60 days', '-30 days' );

        $start = count( $previous_customers );
        if ( 0 === $start ) {
            return 0.0;
        }

        $lost = count( array_diff( $previous_customers, $current_customers ) );
        return round( ( $lost / $start ) * 100, 2 );
    }

    private function get_refund_rate() {
        $orders       = $this->get_orders();
        $total_orders = count( $orders );
        if ( 0 === $total_orders ) {
            return 0.0;
        }

        $refunded = 0;
        foreach ( $orders as $order ) {
            if ( $order->get_total_refunded() > 0 ) {
                $refunded++;
            }
        }

        return round( ( $refunded / $total_orders ) * 100, 2 );
    }

    private function get_cart_abandonment_rate() {
        return 0.0; // Cart data not available by default
    }

    private function get_orders( array $args = [] ) {
        $defaults = [
            'status' => wc_get_is_paid_statuses(),
            'limit'  => -1,
        ];

        $query = new WC_Order_Query( array_merge( $defaults, $args ) );
        return $query->get_orders();
    }

    private function get_total_revenue() {
        $orders = $this->get_orders();
        $total  = 0.0;
        foreach ( $orders as $order ) {
            $total += $order->get_total();
        }
        return $total;
    }

    private function get_total_refunded() {
        $orders = $this->get_orders();
        $total  = 0.0;
        foreach ( $orders as $order ) {
            $total += $order->get_total_refunded();
        }
        return $total;
    }

    private function get_revenue_last_30_days() {
        $orders = $this->get_orders([
            'date_paid' => '>' . strtotime( '-30 days' ),
        ]);
        $total = 0.0;
        foreach ( $orders as $order ) {
            $total += $order->get_total();
        }
        return $total;
    }

    private function get_customer_ids_in_range( $start, $end ) {
        $orders = $this->get_orders([
            'date_paid' => [
                'after'  => strtotime( $start ),
                'before' => strtotime( $end ),
            ],
        ]);
        $ids = [];
        foreach ( $orders as $order ) {
            $cid = $order->get_customer_id();
            if ( $cid ) {
                $ids[ $cid ] = true;
            }
        }
        return array_keys( $ids );
    }
}
