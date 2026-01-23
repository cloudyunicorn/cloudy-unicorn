// Supabase API service layer for mobile app - Full Database Sync
// Uses direct database queries with RLS policies
// Column naming: userId (camelCase) for keys, created_at/logged_at (snake_case) for timestamps

import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';
import {
    User,
    UserProfile,
    MealPlan,
    WorkoutProgram,
    ProgressLog,
    CalorieLog,
    FitnessGoal,
    DifficultyLevel,
    MealType,
    ProgressType,
} from '@/types/database';

// ==================== User & Profile ====================

export async function getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        auth_id: data.auth_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        goals: data.goals || [],
        is_subscribed: data.isSubscribed || false,
    };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('UserProfile')
        .select('*')
        .eq('userId', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
    }

    if (!data) return null;

    return {
        id: data.id,
        user_id: data.userId,
        age: data.age,
        weight: data.weight,
        height: data.height,
        body_fat_percentage: data.bodyFatPercentage,
        gender: data.gender,
        dietary_preferences: data.dietaryPreferences || [],
        fitness_level: data.fitnessLevel,
        target_weight: data.targetWeight,
        activity_level: data.activityLevel,
        created_at: data.created_at,
    };
}

export async function updateUserProfile(
    userId: string,
    profile: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
    const dbProfile: any = {};
    if (profile.age !== undefined) dbProfile.age = profile.age;
    if (profile.weight !== undefined) dbProfile.weight = profile.weight;
    if (profile.height !== undefined) dbProfile.height = profile.height;
    if (profile.body_fat_percentage !== undefined) dbProfile.bodyFatPercentage = profile.body_fat_percentage;
    if (profile.gender !== undefined) dbProfile.gender = profile.gender;
    if (profile.dietary_preferences !== undefined) dbProfile.dietaryPreferences = profile.dietary_preferences;
    if (profile.fitness_level !== undefined) dbProfile.fitnessLevel = profile.fitness_level;
    if (profile.target_weight !== undefined) dbProfile.targetWeight = profile.target_weight;
    if (profile.activity_level !== undefined) dbProfile.activityLevel = profile.activity_level;

    const { data: existing } = await supabase
        .from('UserProfile')
        .select('id')
        .eq('userId', userId)
        .single();

    if (existing) {
        const { error } = await supabase
            .from('UserProfile')
            .update(dbProfile)
            .eq('userId', userId);

        if (error) return { success: false, error: error.message };
    } else {
        const { error } = await supabase
            .from('UserProfile')
            .insert({ ...dbProfile, userId: userId });

        if (error) return { success: false, error: error.message };
    }

    return { success: true };
}

export async function updateUserGoals(
    userId: string,
    goals: FitnessGoal[]
): Promise<{ success: boolean; error?: string }> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
        .from('User')
        .update({ goals })
        .eq('auth_id', authUser.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function updateUserName(
    userId: string,
    name: string
): Promise<{ success: boolean; error?: string }> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
        .from('User')
        .update({ name })
        .eq('auth_id', authUser.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// ==================== Meal Plans ====================

export async function getMealPlans(userId: string): Promise<MealPlan[]> {
    const { data, error } = await supabase
        .from('MealPlan')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false });  // snake_case for timestamp

    if (error) {
        console.error('Error fetching meal plans:', error);
        return [];
    }

    return (data || []).map(d => ({
        id: d.id,
        user_id: d.userId,
        title: d.title,
        description: d.description,
        days: d.days,
        calories_per_day: d.caloriesPerDay,
        dietary_tags: d.dietaryTags || [],
        is_active: d.isActive,
        created_at: d.created_at,
        updated_at: d.updated_at,
    }));
}

export async function saveMealPlan(
    userId: string,
    title: string,
    description: string,
    caloriesPerDay: number,
    dietaryTags: string[]
): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    console.log('saveMealPlan called with:', { userId, title, caloriesPerDay, dietaryTags });

    const insertData = {
        id: Crypto.randomUUID(),
        userId: userId,
        title,
        description,
        caloriesPerDay,
        dietaryTags,
        days: { content: description },
        isActive: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    console.log('Inserting meal plan:', insertData);

    const { data, error } = await supabase
        .from('MealPlan')
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error('MealPlan insert error:', error);
        return { success: false, error: error.message };
    }

    console.log('MealPlan insert success:', data);

    return {
        success: true,
        data: {
            id: data.id,
            user_id: data.userId,
            title: data.title,
            description: data.description,
            days: data.days,
            calories_per_day: data.caloriesPerDay,
            dietary_tags: data.dietaryTags || [],
            is_active: data.isActive,
            created_at: data.created_at,
            updated_at: data.updated_at,
        }
    };
}

export async function deleteMealPlan(
    planId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('MealPlan')
        .delete()
        .eq('id', planId)
        .eq('userId', userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// ==================== Workout Programs ====================

export async function getWorkoutPrograms(userId: string): Promise<WorkoutProgram[]> {
    const { data, error } = await supabase
        .from('WorkoutProgram')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false });  // snake_case for timestamp

    if (error) {
        console.error('Error fetching workout programs:', error);
        return [];
    }

    return (data || []).map(d => ({
        id: d.id,
        user_id: d.userId,
        title: d.title,
        description: d.description,
        duration_weeks: d.durationWeeks,
        days_per_week: d.daysPerWeek,
        difficulty: d.difficulty,
        created_at: d.created_at,
    }));
}

export async function saveWorkoutProgram(
    userId: string,
    title: string,
    description: string,
    difficulty: DifficultyLevel
): Promise<{ success: boolean; data?: WorkoutProgram; error?: string }> {
    const { data, error } = await supabase
        .from('WorkoutProgram')
        .insert({
            id: Crypto.randomUUID(),
            userId: userId,
            title,
            description,
            durationWeeks: 4,
            daysPerWeek: 3,
            difficulty,
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        data: {
            id: data.id,
            user_id: data.userId,
            title: data.title,
            description: data.description,
            duration_weeks: data.durationWeeks,
            days_per_week: data.daysPerWeek,
            difficulty: data.difficulty,
            created_at: data.created_at,
        }
    };
}

export async function deleteWorkoutProgram(
    programId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('WorkoutProgram')
        .delete()
        .eq('id', programId)
        .eq('userId', userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// ==================== Progress Logs ====================

export async function getProgressLogs(userId: string): Promise<ProgressLog[]> {
    const { data, error } = await supabase
        .from('ProgressLog')
        .select('*')
        .eq('userId', userId)
        .order('logged_at', { ascending: false });  // snake_case for timestamp

    if (error) {
        console.error('Error fetching progress logs:', error);
        return [];
    }

    return (data || []).map(d => ({
        id: d.id,
        user_id: d.userId,
        type: d.type,
        value: d.value,
        notes: d.notes,
        photos: d.photos || [],
        workout_session_id: d.workoutSessionId,
        logged_at: d.logged_at,
    }));
}

export async function saveProgressLog(
    userId: string,
    type: ProgressType,
    value: number,
    notes?: string,
    date?: string
): Promise<{ success: boolean; data?: ProgressLog; error?: string }> {
    console.log('saveProgressLog called with:', { userId, type, value, notes, date });

    const insertData = {
        id: Crypto.randomUUID(),
        userId: userId,
        type,
        value,
        notes: notes || null,
        photos: [],
    };

    console.log('Inserting progress log:', insertData);

    const { data, error } = await supabase
        .from('ProgressLog')
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error('Insert error:', error);
        return { success: false, error: error.message };
    }

    console.log('Insert successful:', data);

    return {
        success: true,
        data: {
            id: data.id,
            user_id: data.userId,
            type: data.type,
            value: data.value,
            notes: data.notes,
            photos: data.photos || [],
            workout_session_id: data.workoutSessionId,
            logged_at: data.logged_at,
        }
    };
}

// ==================== Calorie Logs ====================

export async function getCalorieLogs(userId: string, date?: string): Promise<CalorieLog[]> {
    let query = supabase
        .from('CalorieLog')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false });  // snake_case for timestamp

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query
            .gte('date', startOfDay.toISOString())
            .lte('date', endOfDay.toISOString());
    }

    const { data, error } = await query.limit(50);

    if (error) {
        console.error('Error fetching calorie logs:', error);
        return [];
    }

    return (data || []).map(d => ({
        id: d.id,
        user_id: d.userId,
        date: d.date,
        meal_type: d.mealType,
        food: d.food,
        calories: d.calories,
        notes: d.notes,
        created_at: d.created_at,
    }));
}

export async function saveCalorieLog(
    userId: string,
    mealType: MealType,
    food: string,
    calories: number,
    notes?: string
): Promise<{ success: boolean; data?: CalorieLog; error?: string }> {
    const { data, error } = await supabase
        .from('CalorieLog')
        .insert({
            id: Crypto.randomUUID(),
            userId: userId,
            date: new Date().toISOString(),
            mealType,
            food,
            calories,
            notes: notes || null,
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        data: {
            id: data.id,
            user_id: data.userId,
            date: data.date,
            meal_type: data.mealType,
            food: data.food,
            calories: data.calories,
            notes: data.notes,
            created_at: data.created_at,
        }
    };
}

export async function deleteCalorieLog(
    logId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('CalorieLog')
        .delete()
        .eq('id', logId)
        .eq('userId', userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// ==================== Stats ====================

export async function getUserStats(userId: string) {
    // Get workouts this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: sessions } = await supabase
        .from('WorkoutSession')
        .select('id')
        .eq('userId', userId)
        .gte('date', weekAgo.toISOString())
        .eq('completed', true);

    // Get latest weight log
    const { data: weightLog } = await supabase
        .from('ProgressLog')
        .select('value, logged_at')  // snake_case
        .eq('userId', userId)
        .eq('type', 'WEIGHT')
        .order('logged_at', { ascending: false })  // snake_case
        .limit(1)
        .single();

    // Get active challenges
    const { data: challenges } = await supabase
        .from('UserChallenge')
        .select('id')
        .eq('userId', userId)
        .eq('completed', false);

    return {
        workoutsThisWeek: sessions?.length || 0,
        activeChallenges: challenges?.length || 0,
        latestWeightLog: weightLog ? {
            value: weightLog.value,
            loggedAt: weightLog.logged_at,
        } : null,
    };
}
