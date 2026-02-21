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
	exit;
}

/**
 * KPI_Helper — static methods for calculating WooCommerce KPIs.
 *
 * Data source is abstracted via Data_Source::get_orders(), which
 * respects the 'dataSource' setting (order_stats or rest_api).
 */
class KPI_Helper {

	/**
	 * Get orders within a date range via the configured data source.
	 *
	 * @param DateTime $start       Start date.
	 * @param DateTime $end         End date.
	 * @param string   $data_source Data source key (order_stats|rest_api).
	 * @return array Array of normalized order data arrays.
	 */
	private static function get_orders( $start, $end, $data_source = 'order_stats' ) {
		return Data_Source::get_orders_in_range( $start, $end, $data_source );
	}

	/**
	 * Calculate KPI stats for a period from a pre-fetched order set.
	 *
	 * This method accepts raw orders (normalized arrays from Data_Source)
	 * so callers can fetch once and reuse.
	 *
	 * @param array $orders         Normalized order arrays.
	 * @param array $prev_customers Customer IDs from previous period for churn.
	 * @return array {
	 *     @type array $stats     KPI stats.
	 *     @type array $customers Unique customer identifiers seen in this period.
	 * }
	 */
	public static function calculate_kpis_from_orders( $orders, $prev_customers = array() ) {
		$revenue         = 0;
		$order_count     = 0;
		$refunded_orders = 0;
		$customers       = array();
		$customer_data   = array();

		foreach ( $orders as $order ) {
			$net           = $order['total'] - $order['refunded'];
			$revenue      += $net;
			$order_count++;

			if ( $order['refunded'] > 0 ) {
				$refunded_orders++;
			}

			$customer_id = $order['customer_id'] ?: $order['billing_email'];

			if ( ! isset( $customers[ $customer_id ] ) ) {
				$customers[ $customer_id ] = true;
				$customer_data[ $customer_id ] = array(
					'total'  => $order['total'],
					'orders' => 1,
					'first'  => $order['created_at'],
					'last'   => $order['created_at'],
				);
			} else {
				$customer_data[ $customer_id ]['total']  += $order['total'];
				$customer_data[ $customer_id ]['orders']++;
				$customer_data[ $customer_id ]['last']    = $order['created_at'];
			}
		}

		$active_customers     = count( $customers );
		$avg_order_value      = $order_count ? $revenue / $order_count : 0;
		$arpu                 = $active_customers ? $revenue / $active_customers : 0;
		$arps                 = $arpu;
		$mrr                  = $active_customers * $arpu;
		$purchase_value_total = 0;
		$purchase_freq_total  = 0;
		$lifespan_total       = 0;

		foreach ( $customer_data as $data ) {
			$purchase_value_total += $data['total'] / $data['orders'];
			$purchase_freq_total  += $data['orders'];
			$lifespan              = ( $data['last'] - $data['first'] ) / YEAR_IN_SECONDS;
			$lifespan_total       += $lifespan > 0 ? $lifespan : ( 1 / 12 );
		}

		$avg_purchase_value = $active_customers ? $purchase_value_total / $active_customers : 0;
		$avg_purchase_freq  = $active_customers ? $purchase_freq_total / $active_customers : 0;
		$avg_customer_life  = $active_customers ? $lifespan_total / $active_customers : 0;
		$ltv                = $avg_purchase_value * $avg_purchase_freq * $avg_customer_life;

		$lost_customers = ! empty( $prev_customers ) ? array_diff( $prev_customers, array_keys( $customers ) ) : array();
		$churn_rate     = ! empty( $prev_customers ) ? ( count( $lost_customers ) / count( $prev_customers ) ) * 100 : 0;
		$refund_rate    = $order_count ? ( $refunded_orders / $order_count ) * 100 : 0;

		// Cart abandonment — estimated from pending/failed vs completed orders.
		$abandonment_rate = self::calculate_abandonment_rate( $orders );

		$stats = array(
			'netRevenue'      => round( $revenue, 2 ),
			'mrr'             => round( $mrr, 2 ),
			'arps'            => round( $arps, 2 ),
			'aov'             => round( $avg_order_value, 2 ),
			'ltv'             => round( $ltv, 2 ),
			'churnRate'       => round( $churn_rate, 2 ),
			'refundRate'      => round( $refund_rate, 2 ),
			'abandonmentRate' => round( $abandonment_rate, 2 ),
		);

		return array(
			'stats'     => $stats,
			'customers' => array_keys( $customers ),
		);
	}

	/**
	 * Estimate cart abandonment rate from order statuses.
	 *
	 * Uses the ratio of pending/failed orders vs total initiated orders.
	 * This is an estimation; accurate abandonment requires session tracking.
	 *
	 * @param array $orders Normalized order arrays.
	 * @return float Abandonment rate as a percentage.
	 */
	private static function calculate_abandonment_rate( $orders ) {
		$total_initiated = count( $orders );
		if ( 0 === $total_initiated ) {
			return 0;
		}

		$abandoned = 0;
		foreach ( $orders as $order ) {
			if ( in_array( $order['status'], array( 'pending', 'failed', 'cancelled' ), true ) ) {
				$abandoned++;
			}
		}

		return ( $abandoned / $total_initiated ) * 100;
	}

	/**
	 * Calculate KPI stats for a date period.
	 *
	 * Fetches orders from the configured data source and computes KPIs.
	 *
	 * @param DateTime $start          Start date.
	 * @param DateTime $end            End date.
	 * @param array    $prev_customers Customer IDs from previous period for churn.
	 * @param string   $data_source    Data source key.
	 * @return array { stats, customers }
	 */
	public static function calculate_period_kpis( $start, $end, $prev_customers = array(), $data_source = 'order_stats' ) {
		$orders = self::get_orders( $start, $end, $data_source );
		return self::calculate_kpis_from_orders( $orders, $prev_customers );
	}

	/**
	 * Get trend data for charts.
	 *
	 * Fetches all orders for the full range ONCE, then partitions into sub-periods
	 * to avoid N+1 database queries.
	 *
	 * @param string   $period      Time period (daily|weekly|monthly).
	 * @param DateTime $start       Start date.
	 * @param DateTime $end         End date.
	 * @param string   $data_source Data source key.
	 * @return array Trend arrays with 'labels' and 'values' for each metric.
	 */
	public static function get_trend_data( $period, $start, $end, $data_source = 'order_stats' ) {
		$trends = array(
			'netRevenue' => array( 'labels' => array(), 'values' => array() ),
			'aov'        => array( 'labels' => array(), 'values' => array() ),
			'churnRate'  => array( 'labels' => array(), 'values' => array() ),
			'refundRate' => array( 'labels' => array(), 'values' => array() ),
		);

		// Fetch all orders for the full range ONCE — no N+1 queries.
		$all_orders = self::get_orders( $start, $end, $data_source );

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

		$end_inclusive = ( clone $end )->modify( '+1 day' );
		$periods       = new DatePeriod( $start, $interval, $end_inclusive );
		$prev_customers = array();

		foreach ( $periods as $period_start ) {
			$period_end = clone $period_start;
			$period_end->add( $interval );
			$period_end->modify( '-1 second' );
			if ( $period_end > $end ) {
				$period_end = clone $end;
			}

			$period_start_ts = $period_start->getTimestamp();
			$period_end_ts   = $period_end->getTimestamp();

			// Filter pre-fetched orders into this sub-period bucket (no DB query).
			$bucket_orders = array_filter(
				$all_orders,
				function ( $order ) use ( $period_start_ts, $period_end_ts ) {
					return $order['created_at'] >= $period_start_ts && $order['created_at'] <= $period_end_ts;
				}
			);

			$data = self::calculate_kpis_from_orders( array_values( $bucket_orders ), $prev_customers );

			$label = 'monthly' === $period
				? $period_start->format( 'M Y' )
				: $period_start->format( 'M j' );

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

	/**
	 * Check if WooCommerce Subscriptions plugin is active.
	 *
	 * @return bool
	 */
	public static function has_subscriptions() {
		return class_exists( 'WC_Subscriptions' );
	}

	/**
	 * Calculate subscription-specific KPI stats.
	 *
	 * Requires WooCommerce Subscriptions plugin to be active.
	 * Queries active subscriptions and calculates MRR, ARPS, and churn rate.
	 *
	 * @param DateTime $start Start date.
	 * @param DateTime $end   End date.
	 * @return array {
	 *     @type float $mrr       Monthly Recurring Revenue.
	 *     @type float $arps      Average Revenue Per Subscription.
	 *     @type float $churnRate Subscription churn rate as percentage.
	 * }
	 */
	public static function calculate_subscription_stats( $start, $end ) {
		if ( ! self::has_subscriptions() ) {
			return array(
				'mrr'       => 0,
				'arps'      => 0,
				'churnRate' => 0,
			);
		}

		global $wpdb;

		$start_formatted = $start->format( 'Y-m-d H:i:s' );
		$end_formatted   = $end->format( 'Y-m-d 23:59:59' );

		// Get active subscriptions with their recurring amounts from order item meta.
		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery
		// phpcs:disable WordPress.DB.DirectDatabaseQuery.NoCaching
		$active_subs = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT p.ID as sub_id, pm.meta_value as recurring_amount
				FROM {$wpdb->posts} AS p
				INNER JOIN {$wpdb->postmeta} AS pm ON pm.post_id = p.ID AND pm.meta_key = '_order_total'
				WHERE p.post_type = 'shop_subscription'
				AND p.post_status = 'wc-active'
				AND p.post_date >= %s
				AND p.post_date <= %s",
				$start_formatted,
				$end_formatted
			),
			ARRAY_A
		);

		// Count cancelled subscriptions for churn rate.
		$cancelled_subs = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(ID)
				FROM {$wpdb->posts}
				WHERE post_type = 'shop_subscription'
				AND post_status = 'wc-cancelled'
				AND post_date >= %s
				AND post_date <= %s",
				$start_formatted,
				$end_formatted
			)
		);
		// phpcs:enable

		$active_count   = is_array( $active_subs ) ? count( $active_subs ) : 0;
		$cancelled_count = (int) $cancelled_subs;
		$total_subs      = $active_count + $cancelled_count;

		// Sum monthly recurring revenue from active subscriptions.
		$mrr = 0.0;
		if ( ! empty( $active_subs ) ) {
			foreach ( $active_subs as $sub ) {
				$mrr += (float) $sub['recurring_amount'];
			}
		}

		$arps      = $active_count > 0 ? $mrr / $active_count : 0;
		$churn_rate = $total_subs > 0 ? ( $cancelled_count / $total_subs ) * 100 : 0;

		return array(
			'mrr'       => round( $mrr, 2 ),
			'arps'      => round( $arps, 2 ),
			'churnRate' => round( $churn_rate, 2 ),
		);
	}
}
