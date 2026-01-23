// Data Context Provider for mobile app
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
    UserData,
    FitnessGoal,
    ProgressType,
    MealPlan,
    WorkoutProgram,
    ProgressLog,
    CalorieLog,
} from '@/types/database';
import {
    getCurrentUser,
    getUserProfile,
    getUserStats,
    getMealPlans,
    getWorkoutPrograms,
    getProgressLogs,
    getCalorieLogs,
    saveProgressLog as apiSaveProgressLog,
    saveMealPlan as apiSaveMealPlan,
    deleteMealPlan as apiDeleteMealPlan,
    saveWorkoutProgram as apiSaveWorkoutProgram,
    deleteWorkoutProgram as apiDeleteWorkoutProgram,
    saveCalorieLog as apiSaveCalorieLog,
    deleteCalorieLog as apiDeleteCalorieLog,
    updateUserProfile as apiUpdateUserProfile,
    updateUserGoals as apiUpdateUserGoals,
} from '@/lib/api';

interface DataContextProps {
    data: UserData | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    // Actions
    addProgressLog: (type: ProgressType, value: number, notes?: string) => Promise<void>;
    addMealPlan: (title: string, description: string, calories: number, tags: string[]) => Promise<void>;
    removeMealPlan: (planId: string) => Promise<void>;
    addWorkoutProgram: (title: string, description: string, difficulty: string) => Promise<void>;
    removeWorkoutProgram: (programId: string) => Promise<void>;
    addCalorieLog: (mealType: string, food: string, calories: number, notes?: string) => Promise<void>;
    removeCalorieLog: (logId: string) => Promise<void>;
    updateProfile: (profile: any) => Promise<void>;
    updateGoals: (goals: FitnessGoal[]) => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const [data, setData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!authUser) {
            setData(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const user = await getCurrentUser();
            if (!user) {
                setData(null);
                setIsLoading(false);
                return;
            }

            const [profile, stats, mealPlans, workoutPrograms, progressLogs, calorieLogs] = await Promise.all([
                getUserProfile(user.id),
                getUserStats(user.id),
                getMealPlans(user.id),
                getWorkoutPrograms(user.id),
                getProgressLogs(user.id),
                getCalorieLogs(user.id),
            ]);

            setData({
                user,
                profile,
                goals: user.goals || [],
                stats,
                mealPlans,
                workoutPrograms,
                progressLogs,
                calorieLogs,
            });
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch data'));
            console.error('Error fetching data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addProgressLog = async (type: ProgressType, value: number, notes?: string) => {
        if (!data?.user) throw new Error('Not authenticated');

        const result = await apiSaveProgressLog(data.user.id, type, value, notes);
        if (!result.success) throw new Error(result.error);

        if (result.data) {
            setData(prev => prev ? {
                ...prev,
                progressLogs: [result.data!, ...prev.progressLogs],
            } : null);
        }
    };

    const addMealPlan = async (title: string, description: string, calories: number, tags: string[]) => {
        if (!data?.user) throw new Error('Not authenticated');

        const result = await apiSaveMealPlan(data.user.id, title, description, calories, tags);
        if (!result.success) throw new Error(result.error);

        if (result.data) {
            setData(prev => prev ? {
                ...prev,
                mealPlans: [result.data!, ...prev.mealPlans],
            } : null);
        }
    };

    const removeMealPlan = async (planId: string) => {
        if (!data?.user) throw new Error('Not authenticated');

        const result = await apiDeleteMealPlan(planId, data.user.id);
        if (!result.success) throw new Error(result.error);

        setData(prev => prev ? {
            ...prev,
            mealPlans: prev.mealPlans.filter(p => p.id !== planId),
        } : null);
    };

    const addWorkoutProgram = async (title: string, description: string, difficulty: string) => {
        if (!data?.user) throw new Error('Not authenticated');

        const result = await apiSaveWorkoutProgram(data.user.id, title, description, difficulty as any);
        if (!result.success) throw new Error(result.error);

        if (result.data) {
            setData(prev => prev ? {
                ...prev,
                workoutPrograms: [result.data!, ...prev.workoutPrograms],
            } : null);
        }
    };

    const removeWorkoutProgram = async (programId: string) => {
        if (!data?.user) throw new Error('Not authenticated');

        const result = await apiDeleteWorkoutProgram(programId, data.user.id);
        if (!result.success) throw new Error(result.error);

        setData(prev => prev ? {
            ...prev,
            workoutPrograms: prev.workoutPrograms.filter(p => p.id !== programId),
        } : null);
    };

    const addCalorieLog = async (mealType: string, food: string, calories: number, notes?: string) => {
        if (!data?.user) throw new Error('Not authenticated');

        const result = await apiSaveCalorieLog(data.user.id, mealType as any, food, calories, notes);
        if (!result.success) throw new Error(result.error);

        if (result.data) {
            setData(prev => prev ? {
                ...prev,
                calorieLogs: [result.data!, ...prev.calorieLogs],
            } : null);
        }
    };

    const removeCalorieLog = async (logId: string) => {
        if (!data?.user) throw new Error('Not authenticated');

        const result = await apiDeleteCalorieLog(logId, data.user.id);
        if (!result.success) throw new Error(result.error);

        setData(prev => prev ? {
            ...prev,
            calorieLogs: prev.calorieLogs.filter(l => l.id !== logId),
        } : null);
    };

    const updateProfile = async (profile: any) => {
        if (!data?.user) throw new Error('Not authenticated');

        const result = await apiUpdateUserProfile(data.user.id, profile);
        if (!result.success) throw new Error(result.error);

        await fetchData(); // Refetch to get updated profile
    };

    const updateGoals = async (goals: FitnessGoal[]) => {
        if (!data?.user) throw new Error('Not authenticated');

        const result = await apiUpdateUserGoals(data.user.id, goals);
        if (!result.success) throw new Error(result.error);

        setData(prev => prev ? {
            ...prev,
            goals,
        } : null);
    };

    const value: DataContextProps = {
        data,
        isLoading,
        error,
        refetch: fetchData,
        addProgressLog,
        addMealPlan,
        removeMealPlan,
        addWorkoutProgram,
        removeWorkoutProgram,
        addCalorieLog,
        removeCalorieLog,
        updateProfile,
        updateGoals,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextProps => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
