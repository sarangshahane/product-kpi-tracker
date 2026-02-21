<?php
/**
 * Weekly KPI Report email template.
 *
 * Variables available in this template:
 *   $email_heading    : string — heading text
 *   $current_stats    : array  — current week KPI stats
 *   $previous_stats   : array  — previous week KPI stats
 *   $email_footer_text: string — footer text (passed by WC_Email::get_footer())
 *   $blogname         : string — site name
 *
 * @package ProductKPITracker
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render a single stat row in the table.
 *
 * @param string     $label    Metric label.
 * @param string     $current  Formatted current value.
 * @param string     $previous Formatted previous value.
 * @param float|null $change   Percentage change (positive = up, negative = down).
 * @param bool       $lower_is_better Whether a lower number is better (churn, refund).
 */
function pkt_stat_row( $label, $current, $previous, $change = null, $lower_is_better = false ) {
	$arrow = '';
	$color = '#555';

	if ( null !== $change ) {
		if ( $change > 0 ) {
			$arrow = $lower_is_better ? '▲' : '▲';
			$color = $lower_is_better ? '#e53e3e' : '#38a169';
		} elseif ( $change < 0 ) {
			$arrow = $lower_is_better ? '▼' : '▼';
			$color = $lower_is_better ? '#38a169' : '#e53e3e';
		}
	}

	$change_text = null !== $change ? sprintf( '%s %.1f%%', $arrow, abs( $change ) ) : '—';
	?>
	<tr>
		<td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-size: 14px;">
			<?php echo esc_html( $label ); ?>
		</td>
		<td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 14px;">
			<?php echo esc_html( $current ); ?>
		</td>
		<td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
			<?php echo esc_html( $previous ); ?>
		</td>
		<td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: <?php echo esc_attr( $color ); ?>; font-weight: 600;">
			<?php echo esc_html( $change_text ); ?>
		</td>
	</tr>
	<?php
}

/**
 * Calculate % change, returns null if previous is 0.
 *
 * @param float $current  Current value.
 * @param float $previous Previous value.
 * @return float|null
 */
function pkt_pct_change( $current, $previous ) {
	if ( ! $previous ) {
		return null;
	}
	return ( ( $current - $previous ) / $previous ) * 100;
}

	$cs    = $current_stats;
	$ps    = $previous_stats;
	$fmt_c = function ( $v ) { return '$' . number_format( $v, 2 ); };
	$fmt_p = function ( $v ) { return number_format( $v, 1 ) . '%'; };
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title><?php echo esc_html( $email_heading ); ?></title>
	</head>
	<body style="margin: 0; padding: 0; background: #f7fafc; font-family: Arial, Helvetica, sans-serif;">

		<table width="100%" cellpadding="0" cellspacing="0" style="background: #f7fafc;">
			<tr>
				<td align="center" style="padding: 40px 0;">

					<table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

						<!-- Header -->
						<tr>
							<td style="background: #2b6cb0; padding: 28px 32px; text-align: center;">
								<h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">
									<?php echo esc_html( $email_heading ); ?>
								</h1>
								<p style="margin: 8px 0 0; color: #bee3f8; font-size: 14px;">
									<?php echo esc_html( $blogname ); ?> · <?php echo esc_html( wp_date( 'F j, Y' ) ); ?>
								</p>
							</td>
						</tr>

						<!-- Intro -->
						<tr>
							<td style="padding: 24px 32px 16px;">
								<p style="margin: 0; font-size: 15px; color: #4a5568;">
									<?php esc_html_e( 'Here is your weekly KPI summary. All figures compare this week to the previous week.', 'product-kpi-tracker' ); ?>
								</p>
							</td>
						</tr>

						<!-- Stats table -->
						<tr>
							<td style="padding: 0 32px 24px;">
								<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
									<thead>
										<tr style="background: #edf2f7;">
											<th style="padding: 10px 16px; text-align: left; font-size: 13px; color: #718096; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
												<?php esc_html_e( 'Metric', 'product-kpi-tracker' ); ?>
											</th>
											<th style="padding: 10px 16px; text-align: left; font-size: 13px; color: #718096; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
												<?php esc_html_e( 'This Week', 'product-kpi-tracker' ); ?>
											</th>
											<th style="padding: 10px 16px; text-align: left; font-size: 13px; color: #718096; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
												<?php esc_html_e( 'Last Week', 'product-kpi-tracker' ); ?>
											</th>
											<th style="padding: 10px 16px; text-align: left; font-size: 13px; color: #718096; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
												<?php esc_html_e( 'Change', 'product-kpi-tracker' ); ?>
											</th>
										</tr>
									</thead>
									<tbody>
										<?php
										pkt_stat_row( __( 'Net Revenue', 'product-kpi-tracker' ), $fmt_c( $cs['netRevenue'] ), $fmt_c( $ps['netRevenue'] ), pkt_pct_change( $cs['netRevenue'], $ps['netRevenue'] ) );
										pkt_stat_row( __( 'Avg Order Value', 'product-kpi-tracker' ), $fmt_c( $cs['aov'] ), $fmt_c( $ps['aov'] ), pkt_pct_change( $cs['aov'], $ps['aov'] ) );
										pkt_stat_row( __( 'MRR', 'product-kpi-tracker' ), $fmt_c( $cs['mrr'] ), $fmt_c( $ps['mrr'] ), pkt_pct_change( $cs['mrr'], $ps['mrr'] ) );
										pkt_stat_row( __( 'Churn Rate', 'product-kpi-tracker' ), $fmt_p( $cs['churnRate'] ), $fmt_p( $ps['churnRate'] ), pkt_pct_change( $cs['churnRate'], $ps['churnRate'] ), true );
										pkt_stat_row( __( 'Refund Rate', 'product-kpi-tracker' ), $fmt_p( $cs['refundRate'] ), $fmt_p( $ps['refundRate'] ), pkt_pct_change( $cs['refundRate'], $ps['refundRate'] ), true );
										pkt_stat_row( __( 'Cart Abandonment', 'product-kpi-tracker' ), $fmt_p( $cs['abandonmentRate'] ), $fmt_p( $ps['abandonmentRate'] ), pkt_pct_change( $cs['abandonmentRate'], $ps['abandonmentRate'] ), true );
										?>
									</tbody>
								</table>
							</td>
						</tr>

						<!-- Footer -->
						<tr>
							<td style="padding: 16px 32px; background: #f7fafc; border-top: 1px solid #e2e8f0; text-align: center;">
								<p style="margin: 0; font-size: 12px; color: #a0aec0;">
									<?php esc_html_e( 'Sent by Product KPI Tracker · To change notification settings, visit your plugin settings.', 'product-kpi-tracker' ); ?>
								</p>
							</td>
						</tr>

					</table><!-- /600px wrapper -->

				</td>
			</tr>
		</table>

	</body>
</html>
