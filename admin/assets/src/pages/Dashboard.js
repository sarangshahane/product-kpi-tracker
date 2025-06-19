import React from 'react';
import { Card } from '@bsf/force-ui';
import { useKPI } from '../contexts/KPIContext';

const Dashboard = () => {
  const data = useKPI();

  if (!data) {
    return <p className="p-4 text-center">Loading...</p>;
  }

  const metrics = [
    { label: 'Net Revenue', value: data.netRevenue },
    { label: 'MRR', value: data.mrr },
    { label: 'ARPS', value: data.arps },
    { label: 'AOV', value: data.aov },
    { label: 'LTV', value: data.ltv },
    { label: 'Churn Rate', value: data.churnRate },
    { label: 'Refund Rate', value: data.refundRate },
    { label: 'Abandonment Rate', value: data.abandonmentRate },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-4 text-center" title={metric.label}>
          <span className="text-2xl font-bold">{metric.value}</span>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
