import React, { useContext, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { ChartAreaInteractive } from '../chart-area-interactive';
import ProgressLogDialog from './ProgressLogDialog';

interface MetricData {
  type: string;
  value: number;
  date: string;
}

const ProgressTrack = () => {
  const { data } = useData();
  const userMetrics = data?.stats?.metrics || [];
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('30d');

  const metricOptions = [
    { value: 'weight', label: 'Weight', unit: 'kg', range: 'Healthy range: 50-90kg' },
    { value: 'bodyFat', label: 'Body Fat %', unit: '%', range: 'Healthy range: 8-25%' },
    { value: 'workouts', label: 'Workouts Completed', unit: '', range: 'Recommended: 3-5/week' }
  ];

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const filteredData = userMetrics
    ?.filter(metric => metric.type === selectedMetric)
    ?.slice(0, timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);

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
            <ChartAreaInteractive 
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
