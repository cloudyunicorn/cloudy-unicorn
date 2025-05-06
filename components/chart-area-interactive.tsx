"use client"

import { Dumbbell, Utensils, Scale } from "lucide-react"
import { useData } from "@/contexts/DataContext"
import { calculateBMI } from "@/utils/body-calculations"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ChartAreaInteractive() {
  const { data: userData } = useData();
  const profile = userData?.profile;
  const stats = userData?.stats;

  const workoutsSaved = userData?.workoutPrograms?.length || 0;
  const mealsSaved = userData?.mealPlans?.length || 0;
  const bmi = profile?.weight && profile?.height 
    ? calculateBMI(profile.weight, profile.height) 
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fitness Summary</CardTitle>
        <CardDescription>
          Your key fitness metrics at a glance
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Workouts Saved */}
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            <h3 className="font-medium">Workouts Saved</h3>
          </div>
          <div className="text-2xl font-bold">{workoutsSaved}</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${Math.min(workoutsSaved * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Meals Saved */}
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <h3 className="font-medium">Meals Saved</h3>
          </div>
          <div className="text-2xl font-bold">{mealsSaved}</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${Math.min(mealsSaved * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Body Metrics */}
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="font-medium">Body Metrics</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Weight</p>
              <p className="font-medium">
                {profile?.weight ? `${profile.weight} kg` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Height</p>
              <p className="font-medium">
                {profile?.height ? `${profile.height} cm` : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">BMI</p>
              <p className="font-medium">
                {bmi ? bmi.toFixed(1) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Workouts</p>
              <p className="font-medium">
                {stats?.workoutsThisWeek || 0} this week
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
