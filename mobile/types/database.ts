// Database types matching Prisma schema

export enum FitnessGoal {
    WEIGHT_LOSS = 'WEIGHT_LOSS',
    MUSCLE_GAIN = 'MUSCLE_GAIN',
    MAINTENANCE = 'MAINTENANCE',
    ENDURANCE = 'ENDURANCE',
    FLEXIBILITY = 'FLEXIBILITY',
}

export enum DifficultyLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
    PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum ActivityLevel {
    SEDENTARY = 'SEDENTARY',
    LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
    MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
    VERY_ACTIVE = 'VERY_ACTIVE',
    EXTREMELY_ACTIVE = 'EXTREMELY_ACTIVE',
}

export enum MealType {
    BREAKFAST = 'BREAKFAST',
    LUNCH = 'LUNCH',
    DINNER = 'DINNER',
    SNACK = 'SNACK',
}

export enum ProgressType {
    WEIGHT = 'WEIGHT',
    BODY_FAT = 'BODY_FAT',
}

// Database Models
export interface User {
    id: string;
    email: string;
    name: string | null;
    auth_id: string;
    created_at: string;
    updated_at: string;
    goals: FitnessGoal[];
    is_subscribed: boolean | null;
}

export interface UserProfile {
    id: string;
    user_id: string;
    age: number | null;
    weight: number | null;
    height: number | null;
    body_fat_percentage: number | null;
    gender: Gender | null;
    dietary_preferences: string[];
    fitness_level: DifficultyLevel | null;
    target_weight: number | null;
    activity_level: ActivityLevel | null;
    created_at: string;
}

export interface MealPlan {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    days: any; // JSON structure
    calories_per_day: number;
    dietary_tags: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WorkoutProgram {
    id: string;
    user_id: string;
    title: string;
    description: string;
    duration_weeks: number;
    days_per_week: number;
    difficulty: DifficultyLevel;
    created_at: string;
}

export interface ProgressLog {
    id: string;
    user_id: string;
    type: ProgressType;
    value: number;
    notes: string | null;
    photos: string[];
    workout_session_id: string | null;
    logged_at: string;
}

export interface CalorieLog {
    id: string;
    user_id: string;
    date: string;
    meal_type: MealType;
    food: string;
    calories: number;
    notes: string | null;
    created_at: string;
}

// Context types for AI
export interface FitnessContext {
    diet: string;
    goals: string[];
    fitnessLevel: string;
    healthConditions: string[];
    bodyMetrics: {
        age?: number;
        weight?: number;
        height?: number;
        bodyFatPercentage?: number;
        gender?: string;
        targetWeight?: number;
    };
    currentPlan?: {
        workouts: string[];
    };
}

// User data for context
export interface UserData {
    user: User | null;
    profile: UserProfile | null;
    goals: FitnessGoal[];
    stats: {
        workoutsThisWeek: number;
        activeChallenges: number;
        latestWeightLog: { value: number; loggedAt: string } | null;
    };
    mealPlans: MealPlan[];
    workoutPrograms: WorkoutProgram[];
    progressLogs: ProgressLog[];
    calorieLogs: CalorieLog[];
}
