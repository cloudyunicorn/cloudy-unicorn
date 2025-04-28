import { FitnessContext } from './types';

export const getMealPrompt = (context: FitnessContext, query: string): string => {
  const { bodyMetrics } = context;
  let bodyInfo = '';
  
  if (bodyMetrics) {
    bodyInfo = `Body Metrics:
    - Age: ${bodyMetrics.age || 'not specified'}
    - Gender: ${bodyMetrics.gender || 'not specified'} 
    - Weight: ${bodyMetrics.weight ? `${bodyMetrics.weight} kg` : 'not specified'}
    - Height: ${bodyMetrics.height ? `${bodyMetrics.height} cm` : 'not specified'}
    - Body Fat: ${bodyMetrics.bodyFatPercentage ? `${bodyMetrics.bodyFatPercentage}%` : 'not specified'}
    - Target Weight: ${bodyMetrics.targetWeight ? `${bodyMetrics.targetWeight} kg` : 'not specified'}\n`;
  }

  return `As a nutritionist, suggest personalized meal options considering:
${bodyInfo}
Dietary preferences: ${context.diet}
Health conditions: ${context.healthConditions.join(', ') || 'none'}
Current goals: ${context.goals.join(', ')}

Calculate appropriate calorie and macronutrient ranges based on the provided body metrics and goals.

User query: ${query}

Respond with:
1. 3 meal suggestions with ingredients and detailed recipe
2. Detailed nutritional breakdown (calories, protein, carbs, fats, fiber)
3. Preparation time and difficulty
4. Notes on how these meals align with the user's body metrics and goals`;
};

export const getWorkoutPrompt = (context: FitnessContext, query: string): string => {
  const { bodyMetrics } = context;
  let bodyInfo = '';
  
  if (bodyMetrics) {
    bodyInfo = `Body Metrics:
    - Age: ${bodyMetrics.age || 'not specified'}
    - Gender: ${bodyMetrics.gender || 'not specified'} 
    - Weight: ${bodyMetrics.weight ? `${bodyMetrics.weight} kg` : 'not specified'}
    - Height: ${bodyMetrics.height ? `${bodyMetrics.height} cm` : 'not specified'}
    - Body Fat: ${bodyMetrics.bodyFatPercentage ? `${bodyMetrics.bodyFatPercentage}%` : 'not specified'}\n`;
  }

  return `As a personal trainer, create a personalized workout plan considering:
${bodyInfo}
Fitness level: ${context.fitnessLevel}
Available equipment: ${context.currentPlan?.workouts?.join(', ') || 'None specified'}
Health considerations: ${context.healthConditions.join(', ') || 'None'}

Adjust workout intensity and exercise selection based on the user's body metrics.

User query: ${query}

Respond with:
1. Warm-up routine tailored to user's fitness level
2. 3-5 exercises with sets/reps, adjusted for body metrics
3. Cool-down suggestions
4. Notes on how this workout aligns with the user's physical characteristics`;
};

export const getHabitPrompt = (context: FitnessContext, query: string): string => {
  const { bodyMetrics } = context;
  let bodyInfo = '';
  
  if (bodyMetrics) {
    bodyInfo = `Body Metrics:
    - Age: ${bodyMetrics.age || 'not specified'}
    - Weight: ${bodyMetrics.weight ? `${bodyMetrics.weight} kg` : 'not specified'}
    - Target Weight: ${bodyMetrics.targetWeight ? `${bodyMetrics.targetWeight} kg` : 'not specified'}
    - Fitness Level: ${context.fitnessLevel}\n`;
  }

  return `As a wellness coach, suggest personalized healthy habits considering:
${bodyInfo}
Current Goals: ${context.goals.join(', ')}

Create habits that are realistic for the user's current physical state and help them progress toward their target weight and goals.

User query: ${query}

Respond with:
1. 3 daily habit suggestions tailored to the user's metrics
2. Specific implementation tips based on their lifestyle
3. Progress tracking methods
4. Expected benefits and timeline for each habit`;
};
