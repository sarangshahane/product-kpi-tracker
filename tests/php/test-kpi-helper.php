<?php
use PHPUnit\Framework\TestCase;
use ProductKPITracker\KPI_Helper;

class KPIHelperTest extends TestCase {
    public function test_aov() {
        $this->assertEquals( 25.0, KPI_Helper::aov( 100, 4 ) );
        $this->assertEquals( 0.0, KPI_Helper::aov( 100, 0 ) );
    }
}
