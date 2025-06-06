<?php
/**
 * API class for Product KPI Tracker
 *
 * @package ProductKPITracker
 * @since 1.0.0
 */

namespace PKT;

/**
 * API class to handle REST API endpoints
 */
class API {

	/**
	 * Instance
	 *
	 * @access private
	 * @var object Class Instance.
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
	 * Constructor
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Register REST API routes
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_rest_routes() {
		register_rest_route(
			'product-kpi-tracker/v1',
			'/dashboard',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_dashboard_data' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			'product-kpi-tracker/v1',
			'/reports',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_reports_data' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			'product-kpi-tracker/v1',
			'/formulas',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_formulas' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			'product-kpi-tracker/v1',
			'/formulas',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_formula' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			'product-kpi-tracker/v1',
			'/formulas/(?P<id>\d+)',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_formula' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			'product-kpi-tracker/v1',
			'/formulas/(?P<id>\d+)',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_formula' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			'product-kpi-tracker/v1',
			'/settings',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_settings' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);

		register_rest_route(
			'product-kpi-tracker/v1',
			'/settings',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_settings' ),
				'permission_callback' => array( $this, 'check_admin_permission' ),
			)
		);
	}

	/**
	 * Check if user has admin permission
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public function check_admin_permission() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get dashboard data
	 *
	 * @since 1.0.0
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
		$end_date = $request->get_param( 'end_date' );
		
		// In a real implementation, this would fetch data from WooCommerce orders
		// and calculate the KPIs based on actual order data
		
		// For demonstration purposes, we'll return mock data
		$data = array(
			'stats' => array(
				'netRevenue'      => 125750.50,
				'mrr'             => 15250.75,
				'arps'            => 49.99,
				'aov'             => 85.25,
				'churnRate'       => 3.2,
				'refundRate'      => 1.8,
				'abandonmentRate' => 68.5,
			),
			'trends' => $this->get_trend_data( $period ),
		);
		
		// Add previous period data for comparison if requested
		if ( $compare_previous ) {
			$data['previous'] = array(
				'stats' => array(
					'netRevenue'      => 118250.25,
					'mrr'             => 14750.50,
					'arps'            => 47.50,
					'aov'             => 82.75,
					'churnRate'       => 3.5,
					'refundRate'      => 2.1,
					'abandonmentRate' => 71.2,
				),
				'trends' => $this->get_trend_data( $period, true ),
			);
		}

		return rest_ensure_response( $data );
	}
	
	/**
	 * Get trend data for charts
	 *
	 * @since 1.0.0
	 * @param string $period Time period (daily, weekly, monthly).
	 * @param bool   $is_previous Whether this is data for the previous period.
	 * @return array
	 */
	private function get_trend_data( $period, $is_previous = false ) {
		$trends = array(
			'netRevenue'  => array(),
			'aov'         => array(),
			'churnRate'   => array(),
			'refundRate'  => array(),
		);
		
		// Generate labels based on period
		$labels = $this->generate_time_labels( $period, $is_previous );
		
		// Generate mock data for each metric
		foreach ( $trends as $metric => &$data ) {
			$data = array(
				'labels' => $labels,
				'values' => $this->generate_mock_values( count( $labels ), $metric, $is_previous ),
			);
		}
		
		return $trends;
	}
	
	/**
	 * Generate time labels based on period
	 *
	 * @since 1.0.0
	 * @param string $period Time period (daily, weekly, monthly).
	 * @param bool   $is_previous Whether this is for the previous period.
	 * @return array
	 */
	private function generate_time_labels( $period, $is_previous = false ) {
		$labels = array();
		$today = new \DateTime();
		
		// For previous period, adjust the starting point
		if ( $is_previous ) {
			switch ( $period ) {
				case 'daily':
					$today->modify( '-14 days' ); // Previous 14 days before the current period
					break;
				case 'weekly':
					$today->modify( '-12 weeks' ); // Previous 12 weeks before the current period
					break;
				case 'monthly':
				default:
					$today->modify( '-12 months' ); // Previous 12 months before the current period
					break;
			}
		}
		
		switch ( $period ) {
			case 'daily':
				// Last 14 days
				for ( $i = 13; $i >= 0; $i-- ) {
					$date = clone $today;
					$date->modify( "-$i days" );
					$labels[] = $date->format( 'M j' );
				}
				break;
				
			case 'weekly':
				// Last 12 weeks
				for ( $i = 11; $i >= 0; $i-- ) {
					$date = clone $today;
					$date->modify( "-$i weeks" );
					$week_start = clone $date;
					$week_start->modify( 'monday this week' );
					$week_end = clone $week_start;
					$week_end->modify( '+6 days' );
					$labels[] = $week_start->format( 'M j' ) . ' - ' . $week_end->format( 'M j' );
				}
				break;
				
			case 'monthly':
			default:
				// Last 12 months
				for ( $i = 11; $i >= 0; $i-- ) {
					$date = clone $today;
					$date->modify( "-$i months" );
					$labels[] = $date->format( 'M Y' );
				}
				break;
		}
		
		return $labels;
	}
	
	/**
	 * Generate mock values for charts
	 *
	 * @since 1.0.0
	 * @param int    $count Number of values to generate.
	 * @param string $metric Metric type.
	 * @param bool   $is_previous Whether this is for the previous period.
	 * @return array
	 */
	private function generate_mock_values( $count, $metric, $is_previous = false ) {
		$values = array();
		
		// Set base values and variation ranges for different metrics
		// For previous period, reduce the base values slightly
		$adjustment_factor = $is_previous ? 0.9 : 1.0;
		
		switch ( $metric ) {
			case 'netRevenue':
				$base = 10000 * $adjustment_factor;
				$min_variation = -1500;
				$max_variation = 2000;
				break;
				
			case 'aov':
				$base = 85 * $adjustment_factor;
				$min_variation = -10;
				$max_variation = 15;
				break;
				
			case 'churnRate':
				$base = 3 * (2 - $adjustment_factor); // Inverse adjustment for churn (higher in previous period)
				$min_variation = -0.5;
				$max_variation = 1;
				break;
				
			case 'refundRate':
				$base = 1.8 * (2 - $adjustment_factor); // Inverse adjustment for refund rate
				$min_variation = -0.3;
				$max_variation = 0.7;
				break;
				
			default:
				$base = 100 * $adjustment_factor;
				$min_variation = -20;
				$max_variation = 30;
		}
		
		// Generate values with some randomness but also a trend
		$trend_factor = 1.0;
		for ( $i = 0; $i < $count; $i++ ) {
			$variation = $min_variation + ( mt_rand() / mt_getrandmax() ) * ( $max_variation - $min_variation );
			$trend_adjustment = $i * ( mt_rand( -10, 15 ) / 100 ); // Small trend adjustment
			
			$value = max( 0, ( $base + $variation ) * $trend_factor + $trend_adjustment );
			
			// Format based on metric type
			if ( in_array( $metric, array( 'churnRate', 'refundRate' ), true ) ) {
				$value = round( $value, 2 ); // 2 decimal places for rates
			} else if ( $metric === 'aov' ) {
				$value = round( $value, 2 ); // 2 decimal places for AOV
			} else {
				$value = round( $value, 0 ); // Whole numbers for revenue
			}
			
			$values[] = $value;
			
			// Adjust trend factor slightly for next iteration
			$trend_factor *= ( 1 + ( mt_rand( -5, 8 ) / 1000 ) );
		}
		
		return $values;
	}

	/**
	 * Get reports data
	 *
	 * @since 1.0.0
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_reports_data( $request ) {
		// Get report type and date range from request.
		$report_type = $request->get_param( 'type' );
		$start_date  = $request->get_param( 'start_date' );
		$end_date    = $request->get_param( 'end_date' );

		// This is a placeholder. In a real implementation, you would fetch data from the database.
		$data = array();

		switch ( $report_type ) {
			case 'sales':
				$data = array(
					array(
						'date'          => '2025-05-01',
						'revenue'       => 1250,
						'orders'        => 15,
						'avgOrderValue' => 83.33,
					),
					array(
						'date'          => '2025-05-02',
						'revenue'       => 980,
						'orders'        => 12,
						'avgOrderValue' => 81.67,
					),
					// Add more data here.
				);
				break;

			case 'products':
				$data = array(
					array(
						'product' => 'Product A',
						'units'   => 45,
						'revenue' => 2250,
						'profit'  => 675,
					),
					array(
						'product' => 'Product B',
						'units'   => 32,
						'revenue' => 1600,
						'profit'  => 480,
					),
					// Add more data here.
				);
				break;

			// Add more report types here.
		}

		return rest_ensure_response( $data );
	}

	/**
	 * Get formulas
	 *
	 * @since 1.0.0
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_formulas( $request ) {
		// This is a placeholder. In a real implementation, you would fetch data from the database.
		$formulas = array(
			array(
				'id'          => 1,
				'name'        => 'Gross Profit Margin',
				'formula'     => '(Revenue - COGS) / Revenue * 100',
				'description' => 'Measures the profitability after accounting for cost of goods sold',
				'isActive'    => true,
				'variables'   => array(
					array(
						'name'   => 'Revenue',
						'source' => 'wc_order_stats.net_total',
					),
					array(
						'name'   => 'COGS',
						'source' => 'product_meta.cost',
					),
				),
			),
			array(
				'id'          => 2,
				'name'        => 'Return on Investment (ROI)',
				'formula'     => '(Revenue - Cost) / Cost * 100',
				'description' => 'Measures the return on investment for marketing campaigns',
				'isActive'    => true,
				'variables'   => array(
					array(
						'name'   => 'Revenue',
						'source' => 'wc_order_stats.net_total',
					),
					array(
						'name'   => 'Cost',
						'source' => 'marketing_costs.total',
					),
				),
			),
			// Add more formulas here.
		);

		return rest_ensure_response( $formulas );
	}

	/**
	 * Create formula
	 *
	 * @since 1.0.0
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function create_formula( $request ) {
		// Get formula data from request.
		$formula = $request->get_json_params();

		// This is a placeholder. In a real implementation, you would save to the database.
		$formula['id'] = 3; // Assign a new ID.

		return rest_ensure_response( $formula );
	}

	/**
	 * Update formula
	 *
	 * @since 1.0.0
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function update_formula( $request ) {
		// Get formula ID and data from request.
		$formula_id = $request->get_param( 'id' );
		$formula    = $request->get_json_params();

		// This is a placeholder. In a real implementation, you would update the database.
		$formula['id'] = $formula_id;

		return rest_ensure_response( $formula );
	}

	/**
	 * Delete formula
	 *
	 * @since 1.0.0
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function delete_formula( $request ) {
		// Get formula ID from request.
		$formula_id = $request->get_param( 'id' );

		// This is a placeholder. In a real implementation, you would delete from the database.
		return rest_ensure_response(
			array(
				'success' => true,
				'id'      => $formula_id,
			)
		);
	}

	/**
	 * Get settings
	 *
	 * @since 1.0.0
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_settings( $request ) {
		// This is a placeholder. In a real implementation, you would fetch from the database.
		$settings = array(
			'general'      => array(
				'enableTracking'    => true,
				'dataRetentionDays' => 90,
				'refreshInterval'   => 'daily',
			),
			'display'      => array(
				'defaultCurrency' => 'USD',
				'dateFormat'      => 'MM/DD/YYYY',
				'decimalPlaces'   => 2,
			),
			'integrations' => array(
				'enableWooCommerce'    => true,
				'enableGoogleAnalytics' => false,
				'googleAnalyticsId'    => '',
				'enableFacebookPixel'  => false,
				'facebookPixelId'      => '',
			),
			'notifications' => array(
				'enableEmailAlerts' => false,
				'emailRecipients'   => '',
				'alertThreshold'    => 10,
			),
		);

		return rest_ensure_response( $settings );
	}

	/**
	 * Update settings
	 *
	 * @since 1.0.0
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function update_settings( $request ) {
		// Get settings data from request.
		$settings = $request->get_json_params();

		// This is a placeholder. In a real implementation, you would save to the database.
		return rest_ensure_response( $settings );
	}
}

// Initialize the API class.
API::get_instance();
