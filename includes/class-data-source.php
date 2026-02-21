<?php
/**
 * Data source abstraction for KPI data fetching.
 *
 * @package ProductKPITracker
 */

namespace PKT;

use DateTime;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Data_Source — abstracts WooCommerce order data retrieval.
 *
 * Supports two sources controlled by the 'dataSource' plugin setting:
 *   - 'order_stats' : Queries wp_wc_order_stats directly (fast, requires WC 3.5+)
 *   - 'rest_api'    : Uses paginated WooCommerce orders API (portable, works with HPOS
 *                     and legacy storage, fetches in batches of 100)
 *
 * Both methods return a normalized array of order data objects so KPI calculations
 * remain identical regardless of which source is active.
 */
class Data_Source {

	/**
	 * Normalized order array shape:
	 *   [
	 *     'id'            => int,
	 *     'total'         => float,
	 *     'refunded'      => float,
	 *     'status'        => string,
	 *     'customer_id'   => int,
	 *     'billing_email' => string,
	 *     'created_at'    => int (Unix timestamp),
	 *   ]
	 */

	/**
	 * Get orders in a date range using the configured data source.
	 *
	 * @param DateTime $start       Start date (inclusive).
	 * @param DateTime $end         End date (inclusive).
	 * @param string   $data_source Data source key. Falls back to plugin setting if empty.
	 * @return array Normalized order data arrays.
	 */
	public static function get_orders_in_range( $start, $end, $data_source = '' ) {
		if ( empty( $data_source ) ) {
			$data_source = self::get_active_source();
		}

		if ( 'order_stats' === $data_source ) {
			return self::query_order_stats_table( $start, $end );
		}

		return self::query_wc_rest_api( $start, $end );
	}

	/**
	 * Get the currently configured data source from plugin settings.
	 *
	 * @return string 'order_stats' (direct DB) or 'rest_api' (paginated WC API)
	 */
	public static function get_active_source() {
		$settings = get_option( 'pkt_settings', array() );
		return isset( $settings['general']['dataSource'] ) ? $settings['general']['dataSource'] : 'order_stats';
	}

	/**
	 * Query order data directly from wp_wc_order_stats table.
	 *
	 * Requires WooCommerce 3.5+ analytics tables.
	 * Joins wp_wc_order_stats with wp_posts for customer email fallback.
	 *
	 * @param DateTime $start Start date.
	 * @param DateTime $end   End date.
	 * @return array Normalized order arrays.
	 */
	private static function query_order_stats_table( $start, $end ) {
		global $wpdb;

		$statuses        = array( 'wc-completed', 'wc-processing', 'wc-on-hold', 'wc-pending', 'wc-failed', 'wc-cancelled' );
		$placeholders    = implode( ', ', array_fill( 0, count( $statuses ), '%s' ) );
		$start_formatted = $start->format( 'Y-m-d H:i:s' );
		$end_formatted   = $end->format( 'Y-m-d 23:59:59' );

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery
		// phpcs:disable WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT
					os.order_id        AS id,
					os.total_sales     AS total,
					(os.total_sales - os.net_total) AS refunded,
					os.status          AS status,
					os.customer_id     AS customer_id,
					pm.meta_value      AS billing_email,
					os.date_created    AS created_at
				FROM {$wpdb->prefix}wc_order_stats AS os
				LEFT JOIN {$wpdb->postmeta} AS pm
					ON pm.post_id = os.order_id AND pm.meta_key = '_billing_email'
				WHERE os.status IN ({$placeholders})
				AND os.date_created >= %s
				AND os.date_created <= %s",
				array_merge( $statuses, array( $start_formatted, $end_formatted ) )
			),
			ARRAY_A
		);
		// phpcs:enable

		if ( empty( $rows ) ) {
			return array();
		}

		return array_map(
			function ( $row ) {
				return array(
					'id'            => (int) $row['id'],
					'total'         => (float) $row['total'],
					'refunded'      => (float) abs( $row['refunded'] ),
					'status'        => str_replace( 'wc-', '', $row['status'] ),
					'customer_id'   => (int) $row['customer_id'],
					'billing_email' => (string) $row['billing_email'],
					'created_at'    => strtotime( $row['created_at'] ),
				);
			},
			$rows
		);
	}

	/**
	 * Query order data via the WooCommerce orders API in paginated batches.
	 *
	 * Uses wc_get_orders() — the same abstraction layer that backs the WC REST API
	 * controller — but fetches in batches of 100 to avoid loading thousands of
	 * WC_Order objects into memory at once. Compatible with both HPOS and legacy
	 * wp_posts storage.
	 *
	 * @param DateTime $start Start date.
	 * @param DateTime $end   End date.
	 * @return array Normalized order arrays.
	 */
	private static function query_wc_rest_api( $start, $end ) {
		$all_orders  = array();
		$page        = 1;
		$per_page    = 100;
		$date_range  = $start->format( 'Y-m-d H:i:s' ) . '...' . $end->format( 'Y-m-d 23:59:59' );
		$statuses    = array( 'completed', 'processing', 'on-hold', 'pending', 'failed', 'cancelled' );

		do {
			$batch = wc_get_orders(
				array(
					'status'       => $statuses,
					'limit'        => $per_page,
					'paged'        => $page,
					'type'         => 'shop_order',
					'date_created' => $date_range,
					'return'       => 'objects',
					'orderby'      => 'date',
					'order'        => 'ASC',
				)
			);

			if ( empty( $batch ) ) {
				break;
			}

			foreach ( $batch as $order ) {
				$all_orders[] = array(
					'id'            => (int) $order->get_id(),
					'total'         => (float) $order->get_total(),
					'refunded'      => (float) $order->get_total_refunded(),
					'status'        => $order->get_status(),
					'customer_id'   => (int) $order->get_customer_id(),
					'billing_email' => (string) $order->get_billing_email(),
					'created_at'    => $order->get_date_created() ? $order->get_date_created()->getTimestamp() : 0,
				);
			}

			++$page;
		} while ( count( $batch ) === $per_page );

		return $all_orders;
	}
}
