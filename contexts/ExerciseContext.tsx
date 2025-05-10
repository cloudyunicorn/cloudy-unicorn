'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getExerciseHistory } from '@/lib/actions/exercise.action';

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  reps: number;
  weight: number;
  sets: number;
  notes?: string;
  date: Date;
  sessionId: string;
}

interface ExerciseContextProps {
  exerciseHistory: ExerciseLog[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const ExerciseContext = createContext<ExerciseContextProps | undefined>(undefined);

interface ExerciseProviderProps {
  children: ReactNode;
}

export const ExerciseProvider: React.FC<ExerciseProviderProps> = ({ children }) => {
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExerciseHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getExerciseHistory();
      if (result?.logs) {
        setExerciseHistory(result.logs.map(log => ({
          ...log,
          date: new Date(log.date)
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exercise history'));
      console.error("Error fetching exercise history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseHistory();
  }, []);

  const value = {
    exerciseHistory,
    isLoading,
    error,
    refetch: fetchExerciseHistory,
  };

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExercise = (): ExerciseContextProps => {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error('useExercise must be used within an ExerciseProvider');
  }
  return context;
};
