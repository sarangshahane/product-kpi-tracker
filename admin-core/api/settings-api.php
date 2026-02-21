<?php
/**
 * PKT Settings API endpoint.
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
 * Settings endpoints:
 *   GET  pkt/v1/settings  — returns current settings
 *   PUT  pkt/v1/settings  — updates settings
 */
class SettingsApi extends ApiBase {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'settings';

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
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'check_permissions' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_settings' ),
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
	 * Default settings shape.
	 *
	 * @return array
	 */
	public static function get_defaults() {
		return array(
			'general'       => array(
				'enableTracking'    => true,
				'dataRetentionDays' => 90,
				'refreshInterval'   => 'daily',
				'dataSource'        => 'order_stats',
			),
			'display'       => array(
				'defaultCurrency' => 'USD',
				'dateFormat'      => 'MM/DD/YYYY',
				'decimalPlaces'   => 2,
			),
			'notifications' => array(
				'enableWeeklyReport' => false,
				'emailRecipients'    => '',
			),
		);
	}

	/**
	 * Get plugin settings.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_settings( $request ) {
		$saved    = get_option( 'pkt_settings', array() );
		$defaults = self::get_defaults();
		$settings = array_replace_recursive( $defaults, $saved );

		return rest_ensure_response( $settings );
	}

	/**
	 * Update plugin settings.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update_settings( $request ) {
		$body = $request->get_json_params();

		if ( empty( $body ) || ! is_array( $body ) ) {
			return new \WP_Error(
				'pkt_invalid_settings',
				__( 'Invalid settings payload.', 'product-kpi-tracker' ),
				array( 'status' => 400 )
			);
		}

		$sanitized = $this->sanitize_settings( $body );
		$saved     = get_option( 'pkt_settings', array() );
		$merged    = array_replace_recursive( $saved, $sanitized );

		update_option( 'pkt_settings', $merged );

		// Bust cache if data source changed.
		if ( isset( $sanitized['general']['dataSource'] ) ) {
			foreach ( array( 'daily', 'weekly', 'monthly' ) as $period ) {
				delete_transient( "pkt_kpi_cache_{$sanitized['general']['dataSource']}_{$period}" );
			}
		}

		return rest_ensure_response(
			array_replace_recursive( self::get_defaults(), $merged )
		);
	}

	/**
	 * Sanitize settings array recursively.
	 *
	 * @param array $settings Raw settings from request.
	 * @return array Sanitized settings.
	 */
	private function sanitize_settings( $settings ) {
		$clean = array();

		if ( isset( $settings['general'] ) && is_array( $settings['general'] ) ) {
			$g = $settings['general'];
			$clean['general'] = array();

			if ( isset( $g['enableTracking'] ) ) {
				$clean['general']['enableTracking'] = (bool) $g['enableTracking'];
			}
			if ( isset( $g['dataRetentionDays'] ) ) {
				$clean['general']['dataRetentionDays'] = absint( $g['dataRetentionDays'] );
			}
			if ( isset( $g['refreshInterval'] ) && in_array( $g['refreshInterval'], array( 'hourly', 'daily', 'weekly' ), true ) ) {
				$clean['general']['refreshInterval'] = sanitize_text_field( $g['refreshInterval'] );
			}
			if ( isset( $g['dataSource'] ) && in_array( $g['dataSource'], array( 'order_stats', 'rest_api' ), true ) ) {
				$clean['general']['dataSource'] = sanitize_text_field( $g['dataSource'] );
			}
		}

		if ( isset( $settings['display'] ) && is_array( $settings['display'] ) ) {
			$d = $settings['display'];
			$clean['display'] = array();

			if ( isset( $d['defaultCurrency'] ) ) {
				$clean['display']['defaultCurrency'] = sanitize_text_field( $d['defaultCurrency'] );
			}
			if ( isset( $d['dateFormat'] ) && in_array( $d['dateFormat'], array( 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD' ), true ) ) {
				$clean['display']['dateFormat'] = sanitize_text_field( $d['dateFormat'] );
			}
			if ( isset( $d['decimalPlaces'] ) ) {
				$clean['display']['decimalPlaces'] = absint( $d['decimalPlaces'] );
			}
		}

		if ( isset( $settings['notifications'] ) && is_array( $settings['notifications'] ) ) {
			$n = $settings['notifications'];
			$clean['notifications'] = array();

			if ( isset( $n['enableWeeklyReport'] ) ) {
				$clean['notifications']['enableWeeklyReport'] = (bool) $n['enableWeeklyReport'];
			}
			if ( isset( $n['emailRecipients'] ) ) {
				$clean['notifications']['emailRecipients'] = sanitize_text_field( $n['emailRecipients'] );
			}
		}

		return $clean;
	}
}
