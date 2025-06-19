<?php
namespace ProductKPITracker;

defined( 'ABSPATH' ) || exit;

class KPI_Helper {
    public static function aov( $revenue, $orders ) {
        $orders = (int) $orders;
        if ( 0 === $orders ) {
            return 0.0;
        }
        return round( floatval( $revenue ) / $orders, 2 );
    }
}
