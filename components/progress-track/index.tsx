import React, { useContext, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { ProgressLineChart } from './ProgressLineChart';
import ProgressLogDialog from './ProgressLogDialog';

interface MetricData {
  type: string;
  value: number;
  date: string;
}

const ProgressTrack = () => {
  const { data } = useData();
  const userMetrics = data?.progressLogs?.map(log => ({
    type: log.type.toLowerCase(),
    value: log.value,
    date: log.loggedAt.toISOString()
  })) || [];
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('30d');

  const metricOptions = [
    { value: 'weight', label: 'Weight', unit: 'kg', range: 'Healthy range: 50-90kg' },
    { value: 'bodyFat', label: 'Body Fat %', unit: '%', range: 'Healthy range: 8-25%' },
    { value: 'bmi', label: 'BMI', unit: '', range: 'Healthy range: 18.5-24.9' }
  ];

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setDate(now.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

  // Get all dates in the selected range
  const allDates = Array.from({length: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90}, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }).reverse();

  // Get logged data for selected metric
  const loggedData = userMetrics
    ?.filter(metric => metric.type === selectedMetric)
    ?.reduce((acc, metric) => {
      const date = new Date(metric.date).toISOString().split('T')[0];
      acc[date] = metric.value;
      return acc;
    }, {} as Record<string, number>);

  // Create complete dataset with all dates
  const filteredData = allDates.map(date => ({
    date,
    value: loggedData?.[date] ?? null,
    type: selectedMetric
  }));

  if (!userMetrics) {
    return <div className="text-center py-8 text-muted-foreground">Loading metrics...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-end mb-4">
        <ProgressLogDialog />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Metric</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {metricOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            {metricOptions.find(m => m.value === selectedMetric)?.range}
          </p>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredData && filteredData.length > 0 ? (
        <>
          <div className="p-4 rounded-lg border">
            <ProgressLineChart 
              data={filteredData}
              metric={selectedMetric}
              unit={metricOptions.find(m => m.value === selectedMetric)?.unit || ''}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium">Starting Value</h3>
              <p className="text-2xl">
                {filteredData[filteredData.length - 1].value}
                <span className="text-sm ml-1">
                  {metricOptions.find(m => m.value === selectedMetric)?.unit}
                </span>
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium">Current Value</h3>
              <p className="text-2xl">
                {filteredData[0].value}
                <span className="text-sm ml-1">
                  {metricOptions.find(m => m.value === selectedMetric)?.unit}
                </span>
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium">Progress</h3>
              <p className="text-2xl">
                {filteredData && filteredData.length > 0 ? 
                  ((filteredData[0].value - filteredData[filteredData.length - 1].value) / 
                   filteredData[filteredData.length - 1].value * 100).toFixed(1) + '%' : 
                  '0%'}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No data available for selected metric and time range
        </div>
      )}
    </div>
  );
};

export default ProgressTrack;
