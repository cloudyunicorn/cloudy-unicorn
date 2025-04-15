export interface FitnessContext {
  goals: string[];
  diet?: string;
  fitnessLevel: string;
  healthConditions: string[];
  currentPlan?: {
    workouts: string[];
    meals?: string[];
  };
}

export interface FitnessResponse {
  message: string;
  suggestions?: {
    workoutAdjustments?: string[];
    mealSuggestions?: string[];
    habitRecommendations?: string[];
  };
}

export interface APIError {
  status: number;
  message: string;
  details?: string;
}

export interface ChutesAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
