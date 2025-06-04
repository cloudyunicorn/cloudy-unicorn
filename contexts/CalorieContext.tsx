'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCalorieHistory, logCalorie } from '@/lib/actions/calorie.action';
import { useUser } from '@/contexts/UserContext';
import { MealType } from '@prisma/client';

export interface CalorieLog {
  id: string;
  food: string;
  calories: number;
  mealType: MealType;
  notes?: string;
  date: Date;
  userId: string;
}

interface CalorieContextProps {
  calorieHistory: CalorieLog[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addCalorie: (formData: FormData) => Promise<void>;
}

const CalorieContext = createContext<CalorieContextProps | undefined>(undefined);

interface CalorieProviderProps {
  children: ReactNode;
}

export const CalorieProvider: React.FC<CalorieProviderProps> = ({ children }) => {
  const [calorieHistory, setCalorieHistory] = useState<CalorieLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCalorieHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const logs = await getCalorieHistory();
      setCalorieHistory(logs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch calorie history'));
      console.error("Error fetching calorie history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalorieHistory();
  }, []);

  const addCalorie = async (formData: FormData) => {
    try {
      const result = await logCalorie(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      await fetchCalorieHistory();
    } catch (error) {
      console.error('Error saving calorie log:', error);
      throw error;
    }
  };

  const value = {
    calorieHistory,
    isLoading,
    error,
    refetch: fetchCalorieHistory,
    addCalorie,
  };

  return (
    <CalorieContext.Provider value={value}>
      {children}
    </CalorieContext.Provider>
  );
};

export const useCalorie = (): CalorieContextProps => {
  const context = useContext(CalorieContext);
  if (context === undefined) {
    throw new Error('useCalorie must be used within a CalorieProvider');
  }
  return context;
};
