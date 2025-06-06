import React, { useState, useEffect } from 'react';
import { Card, Button, Title, Table } from '../fields';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: []
  });

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real implementation, this would be an API call
        // const response = await fetch('/wp-json/product-kpi-tracker/v1/dashboard');
        // const data = await response.json();
        
        // Simulated data
        setTimeout(() => {
          setStats({
            totalSales: 15750,
            averageOrderValue: 85.25,
            conversionRate: 3.2,
            topProducts: [
              { id: 1, name: 'Product A', sales: 2500, growth: 12 },
              { id: 2, name: 'Product B', sales: 1800, growth: -5 },
              { id: 3, name: 'Product C', sales: 1200, growth: 8 },
              { id: 4, name: 'Product D', sales: 950, growth: 15 },
              { id: 5, name: 'Product E', sales: 780, growth: -2 },
            ]
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return '$' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const formatPercentage = (value) => {
    return value.toFixed(1) + '%';
  };

  if (isLoading) {
    return <div className="pkt-p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="pkt-admin-container">
      <Title text="Dashboard Overview" />
      
      <div className="pkt-grid pkt-grid-cols-1 pkt-md:grid-cols-3 pkt-gap-4 pkt-mb-8">
        <Card className="pkt-stat-card">
          <div className="pkt-stat-label">Total Sales</div>
          <div className="pkt-stat-value">{formatCurrency(stats.totalSales)}</div>
          <div className="pkt-text-sm pkt-mt-2 pkt-trend-up">↑ 8.2% from last month</div>
        </Card>
        
        <Card className="pkt-stat-card">
          <div className="pkt-stat-label">Average Order Value</div>
          <div className="pkt-stat-value">{formatCurrency(stats.averageOrderValue)}</div>
          <div className="pkt-text-sm pkt-mt-2 pkt-trend-up">↑ 3.5% from last month</div>
        </Card>
        
        <Card className="pkt-stat-card">
          <div className="pkt-stat-label">Conversion Rate</div>
          <div className="pkt-stat-value">{formatPercentage(stats.conversionRate)}</div>
          <div className="pkt-text-sm pkt-mt-2 pkt-trend-down">↓ 1.2% from last month</div>
        </Card>
      </div>
      
      <div className="pkt-mb-8">
        <div className="pkt-flex pkt-justify-between pkt-items-center pkt-mb-4">
          <Title text="Top Performing Products" level="h3" />
          <Button text="View All Products" variant="secondary" />
        </div>
        
        <Table
          headers={['Product', 'Sales', 'Growth']}
          data={stats.topProducts.map(product => [
            product.name,
            formatCurrency(product.sales),
            <span className={product.growth >= 0 ? 'pkt-trend-up' : 'pkt-trend-down'}>
              {product.growth >= 0 ? '↑' : '↓'} {Math.abs(product.growth)}%
            </span>
          ])}
        />
      </div>
      
      <div className="pkt-flex pkt-justify-end">
        <Button text="Generate Full Report" />
      </div>
    </div>
  );
};

export default Dashboard;
