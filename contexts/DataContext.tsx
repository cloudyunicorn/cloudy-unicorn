'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfileAndGoals, saveProgressLog } from '@/lib/actions/user.action';
import { FitnessGoal, DifficultyLevel, ActivityLevel, ProgressLog, WorkoutSession } from '@prisma/client';
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

type ProgressLogWithWorkout = {
  id: string;
  type: string;
  value: number;
  notes: string | null;
  loggedAt: Date;
  workout?: {
    id?: string;
    duration: number;
    program: {
      title: string;
    };
  } | null;
  photos?: string[];
  userId?: string;
};

type UserData = {
  goals: FitnessGoal[];
  profile: UserProfileData | null;
  stats: UserStatsData;
  workoutPrograms: WorkoutProgram[];
  mealPlans: MealPlan[];
  progressLogs: ProgressLogWithWorkout[];
  workoutSessions: WorkoutSession[];
} | null;

interface DataContextProps {
  data: UserData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  addProgressLog: (log: {
    type: string;
    value: number;
    notes?: string;
    date?: string;
  }) => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<UserData>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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

  useEffect(() => {
    fetchDataInternal();
  }, []);

  const addProgressLog = async (log: {
    type: string;
    value: number;
    notes?: string;
    date?: string;
  }) => {
    const loggedAt = log.date ? new Date(log.date) : new Date();
    
    // Validate type against ProgressType enum
    const validTypes = ['WEIGHT', 'BODY_FAT', 'WORKOUT_COMPLETED'];
    if (!validTypes.includes(log.type)) {
      throw new Error(`Invalid progress type: ${log.type}`);
    }

    const newProgressLog = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: log.type,
      value: log.value,
      notes: log.notes || null,
      loggedAt,
      photos: [],
      workoutSessionId: null
    };

    try {
      // Optimistic update
      setData(prev => prev ? {
        ...prev,
        progressLogs: [newProgressLog, ...prev.progressLogs]
      } : null);

      // Save to database
      const result = await saveProgressLog(log);
      if (result.error) {
        throw new Error(result.error);
      }
      if (!result.log?.id) {
        throw new Error('Failed to save progress log');
      }

      // Update with real ID
      setData(prev => prev ? {
        ...prev,
        progressLogs: prev.progressLogs.map(p => 
          p.id === newProgressLog.id ? { ...p, id: result.log.id } : p
        )
      } : null);
    } catch (error) {
      // Rollback on error
      setData(prev => prev ? {
        ...prev,
        progressLogs: prev.progressLogs.filter(p => p.id !== newProgressLog.id)
      } : null);
      throw error;
    }
  };

  const value = React.useMemo(() => ({
    data,
    isLoading,
    error,
    refetch: fetchDataInternal,
    addProgressLog,
  }), [data, isLoading, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextProps => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
