<?php
namespace ProductKPITracker;

defined( 'ABSPATH' ) || exit;

class Autoloader {
    public static function init() {
        spl_autoload_register( [ __CLASS__, 'autoload' ] );
    }

    public static function autoload( $class ) {
        if ( 0 !== strpos( $class, __NAMESPACE__ ) ) {
            return;
        }

        $class = str_replace( __NAMESPACE__ . '\\', '', $class );
        $class = strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $class ) );
        $path  = PKT_DIR . 'includes/' . str_replace( '_', '-', $class ) . '.php';
        if ( is_readable( $path ) ) {
            include_once $path;
        }
    }
}

Autoloader::init();
