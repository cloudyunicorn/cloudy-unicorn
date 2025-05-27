'use server'

import prisma from '@/lib/prisma';
import { MealType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

interface LogCalorieParams {
  food: string;
  calories: number;
  mealType: MealType;
  userId: string;
  notes?: string;
  date?: string;
}

export async function logCalorie(params: LogCalorieParams) {
  if (!params.userId) {
    throw new Error('User ID is required');
  }
  try {
    // Validate required fields
    if (!params.food || !params.calories || !params.mealType) {
      throw new Error('Missing required fields');
    }

    // Create calorie log
    const calorieLog = await prisma.calorieLog.create({
      data: {
        food: params.food,
        calories: params.calories,
        mealType: params.mealType,
        notes: params.notes || '',
        date: params.date ? new Date(params.date) : new Date(),
        user: {
          connect: {
            authId: params.userId
          }
        }
      }
    });

    revalidatePath('/dashboard');
    return { success: true, data: calorieLog };
  } catch (error) {
    console.error('Error logging calories:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to log calories' 
    };
  }
}
