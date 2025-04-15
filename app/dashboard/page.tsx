import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
// Removed action import - fetching will happen in SectionCards
import React from 'react';

// Revert to a standard functional component
const Dashboard = () => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Render SectionCards without passing data */}
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  );
};

export default Dashboard;
