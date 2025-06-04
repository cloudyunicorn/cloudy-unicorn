'use server'

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { MealType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function logCalorie(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return { error: 'User not authenticated' };
    }

    const userRecord = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true }
    });

    if (!userRecord) {
      throw new Error(`User record not found for auth ID: ${user.id}`);
    }
    const rawData = {
      food: formData.get('food')?.toString() || '',
      calories: Number(formData.get('calories')),
      mealType: formData.get('mealType') as MealType,
      notes: formData.get('notes')?.toString(),
      date: formData.get('date')?.toString()
    };

    // Validate required fields
    if (!rawData.food || !rawData.calories || !rawData.mealType) {
      throw new Error('Missing required fields');
    }

    const calorieLog = await prisma.calorieLog.create({
      data: {
        food: rawData.food,
        calories: rawData.calories,
        mealType: rawData.mealType,
        notes: rawData.notes || '',
        date: rawData.date ? new Date(rawData.date) : new Date(),
        user: { connect: { id: userRecord.id } }
      }
    });

    revalidatePath('/dashboard');
    return { data: calorieLog };
  } catch (error) {
    console.error('Error logging calories:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to log calories' 
    };
  }
}

interface CalorieLogEntry {
  id: string;
  food: string;
  calories: number;
  mealType: MealType;
  notes?: string;
  date: Date;
  userId: string;
}

export async function getCalorieHistory() {
  try {
    const logs = await prisma.calorieLog.findMany({
      orderBy: {
        date: 'desc'
      },
      take: 100, // Limit to 100 most recent logs
      select: {
        id: true,
        food: true,
        calories: true,
        mealType: true,
        notes: true,
        date: true,
        userId: true
      }
    });

    return logs.map(log => ({
      ...log,
      notes: log.notes || undefined,
      date: new Date(log.date)
    }));
  } catch (error) {
    console.error('Error fetching calorie history:', error);
    throw error;
  }
}
