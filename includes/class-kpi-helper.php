<?php
/**
 * Helper class for calculating KPIs.
 *
 * @package ProductKPITracker
 */

namespace PKT;

use DateInterval;
use DatePeriod;
use DateTime;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Class KPI_Helper
 */
class KPI_Helper {

    /**
     * Get orders within a date range.
     *
     * @param DateTime $start Start date.
     * @param DateTime $end   End date.
     * @return array
     */
    private static function get_orders( $start, $end ) {
        return wc_get_orders(
            [
                'status'       => [ 'completed', 'processing', 'on-hold' ],
                'limit'        => -1,
                'type'         => 'shop_order',
                'date_created' => $start->format( 'Y-m-d H:i:s' ) . '...' . $end->format( 'Y-m-d H:i:s' ),
                'return'       => 'objects',
            ]
        );
    }

    /**
     * Calculate KPI stats for a period.
     *
     * @param DateTime $start          Start date.
     * @param DateTime $end            End date.
     * @param array    $prev_customers Customer IDs from previous period for churn calculation.
     * @return array {
     *     @type array  $stats     Calculated KPI stats.
     *     @type array  $customers List of unique customer IDs.
     * }
     */
    public static function calculate_period_kpis( $start, $end, $prev_customers = [] ) {
        $orders            = self::get_orders( $start, $end );
        $revenue           = 0;
        $order_count       = 0;
        $refunded_orders   = 0;
        $customers         = [];
        $customer_data     = [];

        foreach ( $orders as $order ) {
            $revenue     += $order->get_total() - $order->get_total_refunded();
            $order_count++;

            if ( $order->get_total_refunded() > 0 ) {
                $refunded_orders++;
            }

            $customer_id = $order->get_customer_id() ? $order->get_customer_id() : $order->get_billing_email();

            if ( ! isset( $customers[ $customer_id ] ) ) {
                $customers[ $customer_id ] = true;
                $customer_data[ $customer_id ] = [
                    'total' => $order->get_total(),
                    'orders' => 1,
                    'first'  => $order->get_date_created()->getTimestamp(),
                    'last'   => $order->get_date_created()->getTimestamp(),
                ];
            } else {
                $customer_data[ $customer_id ]['total']  += $order->get_total();
                $customer_data[ $customer_id ]['orders']++;
                $customer_data[ $customer_id ]['last']    = $order->get_date_created()->getTimestamp();
            }
        }

        $active_customers      = count( $customers );
        $avg_order_value       = $order_count ? $revenue / $order_count : 0;
        $arpu                  = $active_customers ? $revenue / $active_customers : 0;
        $arps                  = $arpu;
        $mrr                   = $active_customers * $arpu;
        $purchase_value_total  = 0;
        $purchase_freq_total   = 0;
        $lifespan_total        = 0;

        foreach ( $customer_data as $data ) {
            $purchase_value_total += $data['total'] / $data['orders'];
            $purchase_freq_total  += $data['orders'];
            $lifespan             = ( $data['last'] - $data['first'] ) / YEAR_IN_SECONDS;
            $lifespan_total      += $lifespan > 0 ? $lifespan : ( 1 / 12 );
        }

        $avg_purchase_value  = $active_customers ? $purchase_value_total / $active_customers : 0;
        $avg_purchase_freq   = $active_customers ? $purchase_freq_total / $active_customers : 0;
        $avg_customer_life   = $active_customers ? $lifespan_total / $active_customers : 0;
        $ltv                 = $avg_purchase_value * $avg_purchase_freq * $avg_customer_life;

        $lost_customers = array_diff( $prev_customers, array_keys( $customers ) );
        $churn_rate     = $prev_customers ? ( count( $lost_customers ) / count( $prev_customers ) ) * 100 : 0;

        $refund_rate = $order_count ? ( $refunded_orders / $order_count ) * 100 : 0;

        $stats = [
            'netRevenue'      => round( $revenue, 2 ),
            'mrr'             => round( $mrr, 2 ),
            'arps'            => round( $arps, 2 ),
            'aov'             => round( $avg_order_value, 2 ),
            'ltv'             => round( $ltv, 2 ),
            'churnRate'       => round( $churn_rate, 2 ),
            'refundRate'      => round( $refund_rate, 2 ),
            'abandonmentRate' => 0,
        ];

        return [
            'stats'     => $stats,
            'customers' => array_keys( $customers ),
        ];
    }

    /**
     * Get trend data for charts.
     *
     * @param string   $period Time period.
     * @param DateTime $start  Start date.
     * @param DateTime $end    End date.
     * @return array
     */
    public static function get_trend_data( $period, $start, $end ) {
        $trends = [
            'netRevenue' => [],
            'aov'        => [],
            'churnRate'  => [],
            'refundRate' => [],
        ];

        switch ( $period ) {
            case 'daily':
                $interval = new DateInterval( 'P1D' );
                break;
            case 'weekly':
                $interval = new DateInterval( 'P1W' );
                break;
            case 'monthly':
            default:
                $interval = new DateInterval( 'P1M' );
                break;
        }

        $periods = new DatePeriod( $start, $interval, $end->modify( '+1 day' ) );
        $prev_customers = [];

        foreach ( $periods as $period_start ) {
            $period_end = clone $period_start;
            $period_end->add( $interval );
            $period_end->modify( '-1 second' );
            if ( $period_end > $end ) {
                $period_end = clone $end;
            }

            $data  = self::calculate_period_kpis( $period_start, $period_end, $prev_customers );
            $label = $period_start->format( 'M j' );
            if ( 'monthly' === $period ) {
                $label = $period_start->format( 'M Y' );
            }
            $trends['netRevenue']['labels'][] = $label;
            $trends['netRevenue']['values'][] = $data['stats']['netRevenue'];
            $trends['aov']['labels'][]        = $label;
            $trends['aov']['values'][]        = $data['stats']['aov'];
            $trends['churnRate']['labels'][]  = $label;
            $trends['churnRate']['values'][]  = $data['stats']['churnRate'];
            $trends['refundRate']['labels'][] = $label;
            $trends['refundRate']['values'][] = $data['stats']['refundRate'];

            $prev_customers = $data['customers'];
        }

        return $trends;
    }
}
