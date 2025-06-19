<?php
namespace ProductKPITracker\API;

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use ProductKPITracker\KPI_Helper;
use WC_Admin_Report;

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
        if ( class_exists( 'WC_Admin_Report' ) ) {
            return floatval( WC_Admin_Report::get_net_sales() );
        }
        return 0;
    }

    private function get_mrr() {
        $customers = $this->get_active_customers();
        return $customers * $this->get_arps();
    }

    private function get_active_customers() {
        return 0;
    }

    private function get_arps() {
        return 0;
    }

    private function get_aov() {
        $revenue = $this->get_net_revenue();
        $orders  = $this->get_order_count();
        return KPI_Helper::aov( $revenue, $orders );
    }

    private function get_order_count() {
        if ( function_exists( 'wc_orders_count' ) ) {
            return (int) wc_orders_count();
        }
        return 0;
    }

    private function get_ltv() {
        return 0;
    }

    private function get_churn_rate() {
        return 0;
    }

    private function get_refund_rate() {
        return 0;
    }

    private function get_cart_abandonment_rate() {
        return 0;
    }
}
