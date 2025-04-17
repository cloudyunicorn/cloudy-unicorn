'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { FitnessGoal, DifficultyLevel, Gender, ActivityLevel } from '@prisma/client';
import { revalidatePath } from "next/cache";

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export async function signOutAction() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    redirect("/");
};

export async function signInAction(values: FormValues) {
  const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function getUserId() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("User not found");
  }
  return data.user.id;
}

export async function getUserInfo() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("User not found");
  }
  return data.user;
}

// --- Fetch User Profile and Goals Action ---
export async function getUserProfileAndGoals() {
  'use server';
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return null;
    }
    const authId = user.id;

    // Calculate date 7 days ago for workout count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch user data including profile, goals, and related stats
    const userData = await prisma.user.findUnique({
      where: { authId: authId },
      select: {
        id: true,
        goals: true,
        profile: {
          select: {
            age: true,
            weight: true,
            height: true,
            bodyFatPercentage: true,
            gender: true,
            dietaryPreferences: true,
            fitnessLevel: true,
            targetWeight: true,
            activityLevel: true,
          }
        },
        _count: {
          select: {
            workoutSessions: {
              where: {
                completed: true,
                date: { gte: sevenDaysAgo }
              }
            },
            challenges: {
              where: { completed: false }
            }
          }
        },
        progressLogs: {
          where: { type: 'weight' },
          orderBy: { loggedAt: 'desc' },
          take: 1,
          select: { value: true, loggedAt: true }
        },
        workoutPrograms: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        mealPlans: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!userData) {
      console.log(`No user record found for auth ID: ${authId}`);
      return null;
    }

    return {
      goals: userData.goals,
      profile: userData.profile,
      stats: {
        workoutsThisWeek: userData._count.workoutSessions,
        activeChallenges: userData._count.challenges,
        latestWeightLog: userData.progressLogs.length > 0 ? userData.progressLogs[0] : null,
      },
      workoutPrograms: userData.workoutPrograms,
      mealPlans: userData.mealPlans
    };

  } catch (error) {
    console.error("Error fetching user profile/goals:", error);
    return null;
  }
}

// --- Body Info Update Action ---
const bodyInfoSchemaServer = z.object({
  age: z.coerce.number().int().positive().optional().nullable(),
  weight: z.coerce.number().positive().optional().nullable(),
  height: z.coerce.number().positive().optional().nullable(),
  bodyFatPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  dietaryPreferences: z.string().optional().nullable(),
  fitnessLevel: z.nativeEnum(DifficultyLevel).optional().nullable(),
  targetWeight: z.coerce.number().positive().optional().nullable(),
  activityLevel: z.nativeEnum(ActivityLevel).optional().nullable(),
  goals: z.array(z.nativeEnum(FitnessGoal)).min(1, 'Select at least one goal'),
});

type BodyInfoFormDataServer = z.infer<typeof bodyInfoSchemaServer>;

export async function updateUserProfileAndGoals(formData: BodyInfoFormDataServer) {
  'use server';

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { error: "User not authenticated." };
    }
    const userId = user.id;

    const validationResult = bodyInfoSchemaServer.safeParse(formData);
    if (!validationResult.success) {
      console.error("Validation Error:", validationResult.error.errors);
      return { error: "Invalid form data.", details: validationResult.error.flatten() };
    }
    const validatedData = validationResult.data;

    const profileData = {
      age: validatedData.age ?? null,
      weight: validatedData.weight ?? null,
      height: validatedData.height ?? null,
      bodyFatPercentage: validatedData.bodyFatPercentage ?? null,
      gender: validatedData.gender ?? null,
      dietaryPreferences: validatedData.dietaryPreferences?.split(',').map((s: string) => s.trim()).filter(Boolean) ?? [],
      fitnessLevel: validatedData.fitnessLevel ?? null,
      targetWeight: validatedData.targetWeight ?? null,
      activityLevel: validatedData.activityLevel ?? null,
    };

    await prisma.$transaction(async (tx) => {
      const userRecord = await tx.user.findUnique({
        where: { authId: userId },
        select: { id: true },
      });

      if (!userRecord) {
        throw new Error(`User record not found for auth ID: ${userId}`);
      }
      const userUUID = userRecord.id;

      await tx.user.update({
        where: { authId: userId },
        data: {
          goals: validatedData.goals as FitnessGoal[],
        },
      });

      await tx.userProfile.upsert({
        where: { userId: userUUID },
        update: profileData,
        create: {
          userId: userUUID,
          ...profileData,
        },
      });
    });

    revalidatePath('/dashboard');
    return { success: true };

  } catch (error) {
    console.error("Error updating user profile/goals:", error);
    if (error instanceof z.ZodError) {
       return { error: "Validation failed on server.", details: error.flatten() };
    }
    return { error: "An unexpected error occurred while updating your profile." };
  }
}

// --- Save Meal Plan Action ---
export async function saveMealPlan(title: string, content: string, calories: number, tags: string[]) {
  'use server';
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { error: "User not authenticated." };
    }

    const userRecord = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true }
    });

    if (!userRecord) {
      throw new Error(`User record not found for auth ID: ${user.id}`);
    }

    const newMealPlan = await prisma.mealPlan.create({
      data: {
        userId: userRecord.id,
        title: title,
        description: content,
        days: { content: content }, // Store markdown content as JSON
        caloriesPerDay: calories,
        dietaryTags: tags,
      }
    });

    revalidatePath('/dashboard');
    return { success: true, mealPlan: newMealPlan };
  } catch (error) {
    console.error("Error saving meal plan:", error);
    return { error: "Failed to save meal plan." };
  }
}

// --- Save Workout Program Action ---
export async function saveWorkoutProgram(title: string, content: string, difficulty: string) {
  'use server';
  try {
    // Validate inputs
    if (!title || !content) {
      return { error: "Title and content are required" };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { error: "User not authenticated. Please sign in again." };
    }

    const userRecord = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true }
    });

    if (!userRecord) {
      console.error(`User record not found for auth ID: ${user.id}`);
      return { error: "User profile not found. Please complete your profile first." };
    }

    // Convert and validate difficulty level
    const upperDifficulty = difficulty.toUpperCase();
    const validDifficulties = Object.values(DifficultyLevel);
    if (!validDifficulties.includes(upperDifficulty as DifficultyLevel)) {
      return { error: `Invalid difficulty level. Valid options are: ${validDifficulties.join(', ')}` };
    }

    const newWorkoutProgram = await prisma.workoutProgram.create({
      data: {
        userId: userRecord.id,
        title: title,
        description: content,
        durationWeeks: 1, // Default duration
        daysPerWeek: 3, // Default frequency
        difficulty: upperDifficulty as DifficultyLevel,
      }
    });

    revalidatePath('/dashboard');
    return { success: true, workoutProgram: newWorkoutProgram };
  } catch (error) {
    console.error("Error saving workout program:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return { error: "Failed to save workout program. Please try again." };
  }
}

// --- Fetch Saved Meal Plans Action ---
export async function getSavedMealPlans() {
  'use server';
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { error: "User not authenticated." };
    }

    const userRecord = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true }
    });

    if (!userRecord) {
      throw new Error(`User record not found for auth ID: ${user.id}`);
    }

    const plans = await prisma.mealPlan.findMany({
      where: { userId: userRecord.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return { plans };
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return { error: "Failed to fetch meal plans." };
  }
}

// --- Fetch Saved Workout Programs Action ---
export async function getSavedWorkoutPrograms() {
  'use server';
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { error: "User not authenticated." };
    }

    const userRecord = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true }
    });

    if (!userRecord) {
      throw new Error(`User record not found for auth ID: ${user.id}`);
    }

    const programs = await prisma.workoutProgram.findMany({
      where: { userId: userRecord.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return { programs };
  } catch (error) {
    console.error("Error fetching workout programs:", error);
    return { error: "Failed to fetch workout programs." };
  }
}
