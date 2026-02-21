import React, { useState } from 'react';
import { Card, Button, Title, Table, Select, DateRangePicker } from '../fields';

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  const reportTypes = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'products', label: 'Product Performance' },
    { value: 'customers', label: 'Customer Analysis' },
    { value: 'inventory', label: 'Inventory Turnover' }
  ];

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const generateReport = () => {
    setIsLoading(true);
    
    // Simulate API call to generate report
    setTimeout(() => {
      // This would be replaced with actual API data
      const mockData = {
        sales: [
          { date: '2025-05-01', revenue: 1250, orders: 15, avgOrderValue: 83.33 },
          { date: '2025-05-02', revenue: 980, orders: 12, avgOrderValue: 81.67 },
          { date: '2025-05-03', revenue: 1450, orders: 18, avgOrderValue: 80.56 },
          { date: '2025-05-04', revenue: 875, orders: 10, avgOrderValue: 87.50 },
          { date: '2025-05-05', revenue: 1680, orders: 20, avgOrderValue: 84.00 },
        ],
        products: [
          { product: 'Product A', units: 45, revenue: 2250, profit: 675 },
          { product: 'Product B', units: 32, revenue: 1600, profit: 480 },
          { product: 'Product C', units: 28, revenue: 1400, profit: 420 },
          { product: 'Product D', units: 20, revenue: 1000, profit: 300 },
          { product: 'Product E', units: 18, revenue: 900, profit: 270 },
        ],
        customers: [
          { segment: 'New Customers', count: 45, revenue: 3150, avgSpend: 70.00 },
          { segment: 'Returning', count: 32, revenue: 2880, avgSpend: 90.00 },
          { segment: 'Loyal', count: 18, revenue: 1980, avgSpend: 110.00 },
        ],
        inventory: [
          { product: 'Product A', stock: 120, reorderPoint: 25, turnoverRate: 3.2 },
          { product: 'Product B', stock: 85, reorderPoint: 20, turnoverRate: 2.8 },
          { product: 'Product C', stock: 65, reorderPoint: 15, turnoverRate: 3.5 },
          { product: 'Product D', stock: 45, reorderPoint: 10, turnoverRate: 2.5 },
          { product: 'Product E', stock: 30, reorderPoint: 8, turnoverRate: 4.0 },
        ]
      };
      
      setReportData(mockData[reportType]);
      setIsLoading(false);
    }, 1000);
  };

  const formatCurrency = (value) => {
    return '$' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const getReportHeaders = () => {
    switch (reportType) {
      case 'sales':
        return ['Date', 'Revenue', 'Orders', 'Avg. Order Value'];
      case 'products':
        return ['Product', 'Units Sold', 'Revenue', 'Profit'];
      case 'customers':
        return ['Customer Segment', 'Count', 'Revenue', 'Avg. Spend'];
      case 'inventory':
        return ['Product', 'Current Stock', 'Reorder Point', 'Turnover Rate'];
      default:
        return [];
    }
  };

  const getReportRows = () => {
    if (!reportData.length) return [];
    
    switch (reportType) {
      case 'sales':
        return reportData.map(row => [
          row.date,
          formatCurrency(row.revenue),
          row.orders,
          formatCurrency(row.avgOrderValue)
        ]);
      case 'products':
        return reportData.map(row => [
          row.product,
          row.units,
          formatCurrency(row.revenue),
          formatCurrency(row.profit)
        ]);
      case 'customers':
        return reportData.map(row => [
          row.segment,
          row.count,
          formatCurrency(row.revenue),
          formatCurrency(row.avgSpend)
        ]);
      case 'inventory':
        return reportData.map(row => [
          row.product,
          row.stock,
          row.reorderPoint,
          row.turnoverRate.toFixed(1)
        ]);
      default:
        return [];
    }
  };

  return (
    <div className="pkt-admin-container">
      <Title text="Generate Reports" />
      
      <Card className="pkt-mb-6">
        <div className="pkt-flex pkt-flex-col pkt-gap-4 pkt-max-w-96">
          <div className='pkt-flex pkt-flex-col pkt-gap-2'>
            <label className="pkt-label">Report Type</label>
            <Select
              options={reportTypes}
              value={reportType}
              onChange={handleReportTypeChange}
            />
          </div>

          <div className='pkt-flex pkt-flex-col pkt-gap-2'>
            <label className="pkt-label">Date Range</label>
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
            />
          </div>

          <div className='pkt-flex pkt-flex-col pkt-gap-2'>
            <Button
              text="Generate Report"
              onClick={generateReport}
              isLoading={isLoading}
            />
          </div>
        </div>
      </Card>

      {reportData.length > 0 && (
        <div>
          <Title text={reportTypes.find(r => r.value === reportType).label} level="h3" />

          <Table
            headers={getReportHeaders()}
            data={getReportRows()}
          />

          <div className="pkt-flex pkt-justify-end pkt-mt-4">
            <Button text="Export CSV" variant="secondary" className="pkt-mr-2" />
            <Button text="Export PDF" variant="secondary" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
