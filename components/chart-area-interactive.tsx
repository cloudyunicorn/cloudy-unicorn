"use client"

import * as React from "react"
import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Sample fitness data - in a real app this would come from user data
const fitnessData = [
  {
    name: "BMI",
    value: 24.3,
    goal: 22,
    fill: "hsl(var(--chart-1))"
  },
  {
    name: "Calories",
    value: 1800,
    goal: 2200,
    fill: "hsl(var(--chart-2))"
  },
  {
    name: "Protein",
    value: 120,
    goal: 150,
    fill: "hsl(var(--chart-3))"
  },
  {
    name: "Workouts",
    value: 3,
    goal: 5,
    fill: "hsl(var(--chart-4))"
  },
  {
    name: "Weight Goal",
    value: 72,
    goal: 68,
    fill: "hsl(var(--chart-5))"
  },
  {
    name: "Water",
    value: 1.8,
    goal: 2.5,
    fill: "hsl(var(--chart-6))"
  }
]


export function ChartAreaInteractive() {
  const isMobile = useIsMobile()

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Fitness Dashboard</CardTitle>
        <CardDescription>
          Overview of your health and fitness metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {fitnessData.map((metric) => (
            <div key={metric.name} className="flex flex-col items-center">
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="60%"
                    outerRadius="100%"
                    data={[metric]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      background
                      dataKey="goal"
                      fill="hsl(var(--muted))"
                      opacity={0.2}
                    />
                    <RadialBar
                      dataKey="value"
                      fill={metric.fill}
                      cornerRadius={4}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">{metric.name}</p>
                <p className={cn(
                  "text-sm",
                  metric.value >= metric.goal ? "text-green-500" : "text-amber-500"
                )}>
                  {metric.value} / {metric.goal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
