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
		// This is a placeholder. In a real implementation, you would fetch data from the database.
		$data = array(
			'totalSales'       => 15750,
			'averageOrderValue' => 85.25,
			'conversionRate'   => 3.2,
			'topProducts'      => array(
				array(
					'id'     => 1,
					'name'   => 'Product A',
					'sales'  => 2500,
					'growth' => 12,
				),
				array(
					'id'     => 2,
					'name'   => 'Product B',
					'sales'  => 1800,
					'growth' => -5,
				),
				array(
					'id'     => 3,
					'name'   => 'Product C',
					'sales'  => 1200,
					'growth' => 8,
				),
				array(
					'id'     => 4,
					'name'   => 'Product D',
					'sales'  => 950,
					'growth' => 15,
				),
				array(
					'id'     => 5,
					'name'   => 'Product E',
					'sales'  => 780,
					'growth' => -2,
				),
			),
		);

		return rest_ensure_response( $data );
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
