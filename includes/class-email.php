<?php
/**
 * Weekly KPI Report email class.
 *
 * @package ProductKPITracker
 */

namespace PKT;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PKT_Weekly_Report_Email
 *
 * Extends WC_Email to send a weekly summary of KPI metrics.
 * Registered via the woocommerce_email_classes filter.
 * Triggered by the pkt_weekly_email WP-Cron event (every Monday 08:00).
 *
 * AD-9: Send weekly store-performance email with current vs previous week KPIs.
 */
class PKT_Weekly_Report_Email extends \WC_Email {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id             = 'pkt_weekly_report';
		$this->title          = __( 'Weekly KPI Report', 'product-kpi-tracker' );
		$this->description    = __( 'Sends a weekly KPI summary every Monday.', 'product-kpi-tracker' );
		$this->template_base  = PKT_DIR . 'includes/emails/';
		$this->template_html  = 'weekly-report.php';
		$this->template_plain = ''; // Plain text not implemented.
		$this->placeholders   = array(
			'{site_title}' => $this->get_blogname(),
		);

		parent::__construct();
	}

	/**
	 * Get email subject.
	 *
	 * @return string
	 */
	public function get_default_subject() {
		/* translators: %s: site name */
		return sprintf( __( '[%s] Weekly KPI Report', 'product-kpi-tracker' ), $this->get_blogname() );
	}

	/**
	 * Get email heading.
	 *
	 * @return string
	 */
	public function get_default_heading() {
		return __( 'Your Weekly KPI Summary', 'product-kpi-tracker' );
	}

	/**
	 * Send the weekly report to configured recipients.
	 *
	 * Called by the pkt_weekly_email cron callback.
	 *
	 * @return void
	 */
	public static function send_report() {
		// Only send if WooCommerce is active (needed for WC_Email base).
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		$settings = get_option( 'pkt_settings', array() );

		// Check if weekly report is enabled.
		$enabled = isset( $settings['notifications']['enableWeeklyReport'] )
			? (bool) $settings['notifications']['enableWeeklyReport']
			: false;

		if ( ! $enabled ) {
			return;
		}

		// Resolve recipients.
		$recipients_raw = isset( $settings['notifications']['emailRecipients'] )
			? $settings['notifications']['emailRecipients']
			: '';

		$recipients = array_filter(
			array_map( 'sanitize_email', array_map( 'trim', explode( ',', $recipients_raw ) ) )
		);

		if ( empty( $recipients ) ) {
			$recipients = array( get_option( 'admin_email' ) );
		}

		// Fetch current week KPIs.
		$data_source = isset( $settings['general']['dataSource'] ) ? $settings['general']['dataSource'] : 'order_stats';

		$now         = new \DateTime();
		$week_start  = ( clone $now )->modify( 'last monday' );
		$prev_start  = ( clone $week_start )->modify( '-7 days' );
		$prev_end    = ( clone $week_start )->modify( '-1 second' );

		$pre_previous = KPI_Helper::calculate_period_kpis( ( clone $prev_start )->modify( '-7 days' ), ( clone $prev_start )->modify( '-1 second' ), array(), $data_source );
		$previous     = KPI_Helper::calculate_period_kpis( $prev_start, $prev_end, $pre_previous['customers'], $data_source );
		$current      = KPI_Helper::calculate_period_kpis( $week_start, $now, $previous['customers'], $data_source );

		// Instantiate the email and send.
		$mailer    = WC()->mailer();
		$email_obj = $mailer->emails['PKT_Weekly_Report'];

		if ( ! $email_obj instanceof self ) {
			$email_obj = new self();
		}

		foreach ( $recipients as $to ) {
			$email_obj->trigger( $to, $current['stats'], $previous['stats'] );
		}
	}

	/**
	 * Trigger sending to a single recipient.
	 *
	 * @param string $to             Recipient email.
	 * @param array  $current_stats  Current week stats.
	 * @param array  $previous_stats Previous week stats.
	 * @return void
	 */
	public function trigger( $to, $current_stats, $previous_stats ) {
		$this->setup_locale();

		$this->recipient       = $to;
		$this->current_stats   = $current_stats;
		$this->previous_stats  = $previous_stats;

		if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
			$this->restore_locale();
			return;
		}

		$this->send(
			$this->get_recipient(),
			$this->get_subject(),
			$this->get_content(),
			$this->get_headers(),
			$this->get_attachments()
		);

		$this->restore_locale();
	}

	/**
	 * Get HTML email content.
	 *
	 * @return string
	 */
	public function get_content_html() {
		return wc_get_template_html(
			$this->template_html,
			array(
				'email_heading'    => $this->get_heading(),
				'current_stats'    => $this->current_stats,
				'previous_stats'   => $this->previous_stats,
				'blogname'         => $this->get_blogname(),
				'email'            => $this,
			),
			'',
			$this->template_base
		);
	}

	/**
	 * Get plain text content (fallback — not implemented).
	 *
	 * @return string
	 */
	public function get_content_plain() {
		return '';
	}
}
