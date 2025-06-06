import React, { useState, useEffect } from 'react';
import { 
  StatCard, 
  TabPanel, 
  PeriodToggle, 
  Chart, 
  DateRangePicker, 
  ExportButton, 
  ComparisonIndicator,
  PrintableReport,
  UserPreferences
} from '../components';
import apiFetch from '@wordpress/api-fetch';
import { formatCurrency, formatPercentage } from '../utils/formatters';

/**
 * Dashboard Component
 * 
 * Main dashboard page showing KPI stats and charts
 * 
 * @returns {JSX.Element} The Dashboard component
 */
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [showComparison, setShowComparison] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      netRevenue: 0,
      mrr: 0,
      arps: 0,
      aov: 0,
      churnRate: 0,
      refundRate: 0,
      abandonmentRate: 0,
    },
    trends: {
      netRevenue: { labels: [], values: [] },
      aov: { labels: [], values: [] },
      churnRate: { labels: [], values: [] },
      refundRate: { labels: [], values: [] },
    }
  });

  // Fetch dashboard data when period or comparison setting changes
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          period,
          compare: showComparison,
        });

        if (dateRange && dateRange.startDate && dateRange.endDate) {
          params.append('start_date', dateRange.startDate);
          params.append('end_date', dateRange.endDate);
        }

        const data = await apiFetch({
          path: `${window.pktAdminData.restUrl}/dashboard?${params.toString()}`,
          method: 'GET',
        });

        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [period, showComparison, dateRange]);

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    // Reset date range when period changes
    setDateRange(null);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Handle user preferences change
  const handlePreferencesChange = (preferences) => {
    setPeriod(preferences.defaultPeriod);
    setShowComparison(preferences.showComparison);
  };

  // Prepare chart data for each metric
  const prepareChartData = (metric, label) => {
    const { labels, values } = dashboardData.trends[metric] || { labels: [], values: [] };
    
    const backgroundColor = {
      netRevenue: 'rgba(59, 130, 246, 0.2)', // Blue
      aov: 'rgba(16, 185, 129, 0.2)',        // Green
      churnRate: 'rgba(239, 68, 68, 0.2)',    // Red
      refundRate: 'rgba(245, 158, 11, 0.2)',  // Amber
    }[metric] || 'rgba(107, 114, 128, 0.2)';
    
    const borderColor = {
      netRevenue: 'rgb(59, 130, 246)',      // Blue
      aov: 'rgb(16, 185, 129)',             // Green
      churnRate: 'rgb(239, 68, 68)',        // Red
      refundRate: 'rgb(245, 158, 11)',      // Amber
    }[metric] || 'rgb(107, 114, 128)';

    const datasets = [
      {
        label,
        data: values,
        backgroundColor,
        borderColor,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: borderColor,
      }
    ];

    // Add comparison data if available
    if (showComparison && dashboardData.previous && dashboardData.previous.trends[metric]) {
      const prevData = dashboardData.previous.trends[metric];
      datasets.push({
        label: `Previous ${label}`,
        data: prevData.values,
        backgroundColor: 'rgba(107, 114, 128, 0.2)', // Gray
        borderColor: 'rgb(107, 114, 128)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(107, 114, 128)',
        borderDash: [5, 5],
      });
    }

    return {
      labels,
      datasets,
    };
  };

  // Create tab content for each metric
  const createTabContent = (metric, label) => {
    return (
      <div className="pkt-bg-white pkt-rounded-lg pkt-shadow pkt-p-6">
        <div className="pkt-flex pkt-justify-between pkt-items-center pkt-mb-6">
          <h3 className="pkt-text-lg pkt-font-medium">{label}</h3>
          <div className="pkt-flex pkt-gap-2">
            <PeriodToggle 
              activePeriod={period} 
              onChange={handlePeriodChange} 
            />
            <label className="pkt-inline-flex pkt-items-center pkt-ml-4">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="pkt-h-4 pkt-w-4 pkt-text-blue-600 pkt-focus:pkt-ring-blue-500 pkt-border-gray-300 pkt-rounded"
              />
              <span className="pkt-ml-2 pkt-text-sm pkt-text-gray-700">Compare to previous period</span>
            </label>
          </div>
        </div>
        <Chart 
          type="line" 
          data={prepareChartData(metric, label)} 
        />
      </div>
    );
  };

  // Define tabs for the tab panel
  const tabs = [
    {
      id: 'netRevenue',
      title: 'Net Revenue',
      content: createTabContent('netRevenue', 'Net Revenue'),
    },
    {
      id: 'aov',
      title: 'Average Order Value',
      content: createTabContent('aov', 'Average Order Value'),
    },
    {
      id: 'churnRate',
      title: 'Average Churn Rate',
      content: createTabContent('churnRate', 'Average Churn Rate'),
    },
    {
      id: 'refundRate',
      title: 'Average Refund Rate',
      content: createTabContent('refundRate', 'Average Refund Rate'),
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="pkt-flex pkt-justify-center pkt-items-center pkt-h-64">
        <div className="pkt-text-lg pkt-text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="pkt-bg-red-50 pkt-border pkt-border-red-200 pkt-rounded-md pkt-p-4 pkt-my-4">
        <div className="pkt-flex">
          <div className="pkt-text-red-700">
            <p className="pkt-text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats } = dashboardData;
  const prevStats = dashboardData.previous?.stats;

  return (
    <div className="pkt-dashboard">
      <div className="pkt-flex pkt-justify-between pkt-items-center pkt-mb-6">
        <h1 className="pkt-text-2xl pkt-font-bold">Product KPIs Dashboard</h1>
        <div className="pkt-flex pkt-gap-2">
          <DateRangePicker onRangeChange={handleDateRangeChange} />
          <ExportButton data={dashboardData} />
          <PrintableReport data={dashboardData} period={period} />
          <UserPreferences onSave={handlePreferencesChange} />
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="pkt-grid pkt-grid-cols-1 sm:pkt-grid-cols-2 lg:pkt-grid-cols-4 pkt-gap-6 pkt-mb-8">
        <StatCard 
          title="Net Revenue" 
          value={formatCurrency(stats.netRevenue)} 
          trend={prevStats ? (stats.netRevenue > prevStats.netRevenue ? 'positive' : 'negative') : 'neutral'}
          trendText={prevStats ? `${Math.abs(((stats.netRevenue - prevStats.netRevenue) / prevStats.netRevenue * 100).toFixed(1))}% from previous period` : ''}
        />
        <StatCard 
          title="Average Order Value" 
          value={formatCurrency(stats.aov)} 
          trend={prevStats ? (stats.aov > prevStats.aov ? 'positive' : 'negative') : 'neutral'}
          trendText={prevStats ? `${Math.abs(((stats.aov - prevStats.aov) / prevStats.aov * 100).toFixed(1))}% from previous period` : ''}
        />
        <StatCard 
          title="Average Churn Rate" 
          value={formatPercentage(stats.churnRate)} 
          trend={prevStats ? (stats.churnRate < prevStats.churnRate ? 'positive' : 'negative') : 'neutral'}
          trendText={prevStats ? `${Math.abs(((stats.churnRate - prevStats.churnRate) / prevStats.churnRate * 100).toFixed(1))}% from previous period` : ''}
        />
        <StatCard 
          title="Average Refund Rate" 
          value={formatPercentage(stats.refundRate)} 
          trend={prevStats ? (stats.refundRate < prevStats.refundRate ? 'positive' : 'negative') : 'neutral'}
          trendText={prevStats ? `${Math.abs(((stats.refundRate - prevStats.refundRate) / prevStats.refundRate * 100).toFixed(1))}% from previous period` : ''}
        />
      </div>
      
      {/* Additional Stats */}
      <div className="pkt-grid pkt-grid-cols-1 sm:pkt-grid-cols-3 pkt-gap-6 pkt-mb-8">
        <StatCard 
          title="Monthly Recurring Revenue" 
          value={formatCurrency(stats.mrr)} 
          trend={prevStats ? (stats.mrr > prevStats.mrr ? 'positive' : 'negative') : 'neutral'}
          trendText={prevStats ? `${Math.abs(((stats.mrr - prevStats.mrr) / prevStats.mrr * 100).toFixed(1))}% from previous period` : ''}
        />
        <StatCard 
          title="Average Revenue Per Subscription" 
          value={formatCurrency(stats.arps)} 
          trend={prevStats ? (stats.arps > prevStats.arps ? 'positive' : 'negative') : 'neutral'}
          trendText={prevStats ? `${Math.abs(((stats.arps - prevStats.arps) / prevStats.arps * 100).toFixed(1))}% from previous period` : ''}
        />
        <StatCard 
          title="Cart Abandonment Rate" 
          value={formatPercentage(stats.abandonmentRate)} 
          trend={prevStats ? (stats.abandonmentRate < prevStats.abandonmentRate ? 'positive' : 'negative') : 'neutral'}
          trendText={prevStats ? `${Math.abs(((stats.abandonmentRate - prevStats.abandonmentRate) / prevStats.abandonmentRate * 100).toFixed(1))}% from previous period` : ''}
        />
      </div>
      
      {/* Graphs Section */}
      <div className="pkt-mt-8">
        <h2 className="pkt-text-xl pkt-font-semibold pkt-mb-6">Performance Metrics</h2>
        <TabPanel tabs={tabs} />
      </div>
    </div>
  );
};

export default Dashboard;
