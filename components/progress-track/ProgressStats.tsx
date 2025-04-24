"use client"

import React from "react"

interface ProgressStatsProps {
  firstValue: number | undefined
  lastValue: number | undefined
  unit: string
  metric: string
}

export const ProgressStats = ({ firstValue, lastValue, unit, metric }: ProgressStatsProps) => {
  const progressPercentage = firstValue && lastValue && lastValue !== 0 
    ? `${((firstValue - lastValue) / lastValue * 100).toFixed(1)}%`
    : 'N/A'

  const progressValue = firstValue && lastValue
    ? `${(firstValue - lastValue).toFixed(1)}${unit}`
    : ''

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div className="p-4 rounded-lg border">
        <h3 className="font-medium">Current Value</h3>
        <p className="text-2xl font-semibold">
          {lastValue !== undefined ? 
            `${metric === 'bmi' ? lastValue.toFixed(1) : lastValue}${unit}`
            : 'N/A'}
        </p>
      </div>
      <div className="p-4 rounded-lg border">
        <h3 className="font-medium">Starting Value</h3>
        <p className="text-2xl font-semibold">
          {firstValue !== undefined ? 
            `${metric === 'bmi' ? firstValue.toFixed(1) : firstValue}${unit}`
            : 'N/A'}
        </p>
      </div>
      <div className="p-4 rounded-lg border">
        <h3 className="font-medium">Progress</h3>
        <p className="text-2xl font-semibold">
          {progressPercentage}
        </p>
        <p className="text-xs">
          {progressValue}
        </p>
      </div>
    </div>
  )
}
