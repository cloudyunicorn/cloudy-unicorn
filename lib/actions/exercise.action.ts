'use server'

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const exerciseLogSchema = z.object({
  exerciseId: z.string().optional(),
  exerciseName: z.string().min(1, 'Exercise name is required'),
  reps: z.number().min(1, 'Must do at least 1 rep'),
  weight: z.number().min(0, 'Weight cannot be negative'),
  sets: z.number().min(1, 'Must do at least 1 set'),
  notes: z.string().optional(),
  date: z.string().optional()
});

export async function logExercise(formData: FormData) {
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

    // Debug form data values
    const repsValue = formData.get('reps');
    const weightValue = formData.get('weight');
    const setsValue = formData.get('sets');
    
    console.log('Raw form values:', {
      reps: repsValue,
      weight: weightValue,
      sets: setsValue,
      typeOfReps: typeof repsValue,
      typeOfWeight: typeof weightValue,
      typeOfSets: typeof setsValue
    });

    const rawData = {
      exerciseId: formData.get('exerciseId')?.toString(),
      exerciseName: formData.get('exerciseName')?.toString() || '',
      reps: Number(repsValue),
      weight: Number(weightValue),
      sets: Number(setsValue),
      notes: formData.get('notes')?.toString() || '',
      date: formData.get('date')?.toString()
    };

    console.log('Parsed data before validation:', rawData);

    const validationResult = exerciseLogSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.flatten());
      return { 
        error: "Validation failed - " + validationResult.error.errors.map(e => e.message).join(', '),
        details: validationResult.error.flatten()
      };
    }

    const validatedData = validationResult.data;
    const loggedAt = validatedData.date ? new Date(validatedData.date) : new Date();

    // Create or update exercise record
    const exercise = await prisma.exercise.upsert({
      where: { id: validatedData.exerciseId || '' },
      create: {
        name: validatedData.exerciseName,
        description: `User-created exercise: ${validatedData.exerciseName}`,
        equipment: [],
        muscleGroup: [],
        difficulty: 'BEGINNER',
        weight: validatedData.weight,
        reps: validatedData.reps,
        sets: validatedData.sets
      },
      update: {
        weight: validatedData.weight,
        reps: validatedData.reps,
        sets: validatedData.sets
      }
    });

    // Create workout session if none exists for today
    let workoutSession = await prisma.workoutSession.findFirst({
      where: {
        userId: userRecord.id,
        date: {
          gte: new Date(loggedAt.setHours(0, 0, 0, 0)),
          lt: new Date(loggedAt.setHours(23, 59, 59, 999))
        }
      }
    });

    if (!workoutSession) {
      // Create a default program if none exists
      let defaultProgram = await prisma.workoutProgram.findFirst({
        where: {
          userId: userRecord.id,
          title: 'Default Program'
        }
      });

      if (!defaultProgram) {
        defaultProgram = await prisma.workoutProgram.create({
          data: {
            userId: userRecord.id,
            title: 'Default Program',
            description: 'Auto-created program for exercise tracking',
            durationWeeks: 1,
            daysPerWeek: 3,
            difficulty: 'BEGINNER'
          }
        });
      }

      workoutSession = await prisma.workoutSession.create({
        data: {
          userId: userRecord.id,
          programId: defaultProgram.id,
          date: loggedAt,
          duration: 0,
          completed: false,
          notes: '',
          exercisesLogged: []
        }
      });
    }

    // Update exercisesLogged in the session
    const updatedExercises = workoutSession.exercisesLogged && 
      typeof workoutSession.exercisesLogged === 'object' 
      ? [...(workoutSession.exercisesLogged as any[])] 
      : [];

    updatedExercises.push({
      exerciseId: exercise.id,
      name: exercise.name,
      reps: validatedData.reps,
      weight: validatedData.weight,
      sets: validatedData.sets,
      notes: validatedData.notes,
      loggedAt: loggedAt.toISOString()
    });

    await prisma.workoutSession.update({
      where: { id: workoutSession.id },
      data: {
        exercisesLogged: updatedExercises
      }
    });

    revalidatePath('/dashboard');
    return { success: true, exercise };
  } catch (error) {
    console.error("Error logging exercise:", error);
    return { error: "Failed to log exercise." };
  }
}

export async function getExerciseHistory() {
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

    const sessions = await prisma.workoutSession.findMany({
      where: { userId: userRecord.id },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        exercisesLogged: true
      }
    });

    // Transform data into grouped exercise logs by date
    const exerciseLogs = sessions.flatMap(session => {
      const exercises = session.exercisesLogged && 
        typeof session.exercisesLogged === 'object'
        ? session.exercisesLogged as any[]
        : [];
      
      return exercises.map((exercise: any) => ({
        ...exercise,
        sessionId: session.id,
        date: session.date
      }));
    });

    return { logs: exerciseLogs };
  } catch (error) {
    console.error("Error fetching exercise history:", error);
    return { error: "Failed to fetch exercise history." };
  }
}
