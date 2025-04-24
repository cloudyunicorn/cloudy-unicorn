"use client"

import * as React from "react"
import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts"
import { useData } from "@/contexts/DataContext"
import { 
  calculateBMI, 
  getHealthyWeightRange,
  getSuggestedCalories,
  calculateBMR
} from "@/utils/body-calculations"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const getFitnessData = (userData: any) => {
  if (!userData?.profile) return [];

  const { age, weight, height, gender, activityLevel } = userData.profile;
  if (!weight || !height || !age || !gender) return [];

  const bmi = calculateBMI(weight, height);
  const [minWeight, maxWeight] = getHealthyWeightRange(height);
  const bmr = calculateBMR({
    weight,
    height,
    age,
    gender: gender.toLowerCase() as 'male' | 'female',
    activityLevel
  });
  const suggestedCalories = getSuggestedCalories(bmr, activityLevel);

  return [
    {
      name: "BMI",
      value: parseFloat(bmi.toFixed(1)),
      goal: 22, // Ideal BMI
      fill: "hsl(var(--chart-1))"
    },
    {
      name: "Weight",
      value: weight,
      goal: (minWeight + maxWeight) / 2, // Midpoint of healthy range
      fill: "hsl(var(--chart-2))"
    },
    {
      name: "Calories",
      value: userData.stats?.dailyCalories || 0,
      goal: suggestedCalories,
      fill: "hsl(var(--chart-3))"
    },
    {
      name: "Workouts",
      value: userData.stats?.workoutsThisWeek || 0,
      goal: activityLevel === 'SEDENTARY' ? 3 : 5,
      fill: "hsl(var(--chart-4))"
    },
    {
      name: "Body Fat",
      value: userData.profile.bodyFatPercentage || 0,
      goal: gender === 'MALE' ? 15 : 25, // Ideal body fat %
      fill: "hsl(var(--chart-5))"
    },
    {
      name: "Water",
      value: userData.stats?.waterIntake || 0,
      goal: 2.5, // Liters
      fill: "hsl(var(--chart-6))"
    }
  ].filter(item => item.value !== undefined);
};


interface ChartAreaInteractiveProps {
  data?: Array<{
    type: string;
    value: number;
    date: string;
    id?: string;
  }>;
  metric?: string;
  unit?: string;
}

export function ChartAreaInteractive({ 
  data: externalData, 
  metric, 
  unit 
}: ChartAreaInteractiveProps = {}) {
  const { data: contextData, isLoading } = useData();
  const isMobile = useIsMobile();
  
  type FitnessDataItem = {
    name: string;
    value: number;
    goal: number;
    fill: string;
    id?: string;
    key?: string;
  };

  const fitnessData: FitnessDataItem[] = externalData 
    ? externalData.map(item => ({
        name: metric || item.type,
        value: item.value,
        goal: 0, // Will be calculated if using context data
        fill: "hsl(var(--chart-1))",
        id: item.id || `${item.type}-${item.date}`,
        key: item.id || `${item.type}-${item.date}`
      }))
    : getFitnessData(contextData);

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
            <div key={metric.id || metric.name} className="flex flex-col items-center">
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
