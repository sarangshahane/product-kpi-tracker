<?php
/**
 * PKT Sync API endpoint.
 *
 * @package ProductKPITracker
 */

namespace PKT\AdminCore\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use PKT\AdminCore\Api\ApiBase;
use PKT\Data_Source;
use PKT\KPI_Helper;

/**
 * Sync endpoint: POST pkt/v1/sync
 *
 * Clears all pkt_kpi_cache_* transients and rebuilds them for all period
 * variants. Called by the "Sync Now" button in the dashboard.
 */
class SyncApi extends ApiBase {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'sync';

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
		register_rest_route(
			$this->get_api_namespace(),
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'sync_data' ),
					'permission_callback' => array( $this, 'check_permissions' ),
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
	 * Delete all PKT cache transients and rebuild for all periods.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function sync_data( $request ) {
		$data_source = Data_Source::get_active_source();
		$periods     = array( 'daily', 'weekly', 'monthly' );

		// Delete all period caches for this data source.
		foreach ( $periods as $period ) {
			delete_transient( "pkt_kpi_cache_{$data_source}_{$period}" );
		}

		// Rebuild caches for each period.
		foreach ( $periods as $period ) {
			$this->rebuild_cache_for_period( $period, $data_source );
		}

		return rest_ensure_response(
			array(
				'success'   => true,
				'synced_at' => current_time( 'timestamp' ),
				'message'   => __( 'KPI data synced successfully.', 'product-kpi-tracker' ),
			)
		);
	}

	/**
	 * Rebuild KPI cache for a single period.
	 *
	 * @param string $period      Period key (daily|weekly|monthly).
	 * @param string $data_source Data source key.
	 * @return void
	 */
	public static function rebuild_cache_for_period( $period, $data_source ) {
		$end   = new \DateTime();
		$start = new \DateTime( '-30 days' );

		$cache_key = "pkt_kpi_cache_{$data_source}_{$period}";

		$pre_previous = KPI_Helper::calculate_period_kpis(
			( clone $start )->modify( '-60 days' ),
			( clone $start )->modify( '-31 days' ),
			array(),
			$data_source
		);

		$previous = KPI_Helper::calculate_period_kpis(
			( clone $start )->modify( '-30 days' ),
			( clone $start )->modify( '-1 day' ),
			$pre_previous['customers'],
			$data_source
		);

		$current = KPI_Helper::calculate_period_kpis( $start, $end, $previous['customers'], $data_source );

		$data = array(
			'stats'  => $current['stats'],
			'trends' => KPI_Helper::get_trend_data( $period, $start, $end, $data_source ),
		);

		set_transient( $cache_key, $data, DAY_IN_SECONDS );
	}
}
