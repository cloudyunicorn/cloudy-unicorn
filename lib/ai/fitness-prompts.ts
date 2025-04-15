import { FitnessContext } from './types';

export const getMealPrompt = (context: FitnessContext, query: string): string => {
  return `As a nutritionist, suggest meal options considering:
  - Dietary preferences: ${context.diet}
  - Health conditions: ${context.healthConditions.join(', ')}
  - Current goals: ${context.goals.join(', ')}
  
  User query: ${query}
  
  Respond with:
  1. 3 meal suggestions with ingredients
  2. Nutritional breakdown per meal
  3. Preparation time estimates`;
};

export const getWorkoutPrompt = (context: FitnessContext, query: string): string => {
  return `As a personal trainer, create a workout plan considering:
  - Fitness level: ${context.fitnessLevel}
  - Available equipment: ${context.currentPlan?.workouts?.join(', ') || 'None specified'}
  - Health considerations: ${context.healthConditions.join(', ') || 'None'}
  
  User query: ${query}
  
  Respond with:
  1. Warm-up routine
  2. 3-5 exercises with sets/reps
  3. Cool-down suggestions`;
};

export const getHabitPrompt = (context: FitnessContext, query: string): string => {
  return `As a wellness coach, suggest healthy habits considering:
  - Current lifestyle: ${context.fitnessLevel}
  - Goals: ${context.goals.join(', ')}
  
  User query: ${query}
  
  Respond with:
  1. 3 daily habit suggestions
  2. Implementation tips
  3. Progress tracking methods`;
};
