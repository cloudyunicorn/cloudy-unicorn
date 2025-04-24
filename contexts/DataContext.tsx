'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfileAndGoals } from '@/lib/actions/user.action';
import { FitnessGoal, DifficultyLevel, ActivityLevel } from '@prisma/client';
import { WorkoutProgram } from '@/components/workout-plans/SavedWorkoutsList';
import { MealPlan } from '@/components/meal-plans/MealPlansList';

type UserProfileData = {
  age: number | null;
  weight: number | null;
  height: number | null;
  bodyFatPercentage: number | null;
  dietaryPreferences: string[];
  fitnessLevel: DifficultyLevel | null;
  targetWeight: number | null;
  gender: string | null;
  activityLevel: ActivityLevel | null;
};

type UserStatsData = {
  workoutsThisWeek: number;
  activeChallenges: number;
  latestWeightLog: { value: number; loggedAt: Date } | null;
  metrics: Array<{
    type: string;
    value: number;
    date: string;
  }>;
};

type UserData = {
  goals: FitnessGoal[];
  profile: UserProfileData | null;
  stats: UserStatsData;
  workoutPrograms: WorkoutProgram[];
  mealPlans: MealPlan[];
} | null;

interface DataContextProps {
  data: UserData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void; // Optional: function to manually refetch data
}

// Create the context with a default value
const DataContext = createContext<DataContextProps | undefined>(undefined);

// Define the props for the provider component
interface DataProviderProps {
  children: ReactNode;
}

// Create the provider component
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<UserData>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch data
  const fetchDataInternal = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUserProfileAndGoals();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on initial mount
  useEffect(() => {
    fetchDataInternal();
  }, []);

  // Create a stable reference for the context value
  const value = React.useMemo(() => ({
    data,
    isLoading,
    error,
    refetch: fetchDataInternal,
  }), [data, isLoading, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use the DataContext
export const useData = (): DataContextProps => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
