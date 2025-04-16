/**
 * Body calculation utilities
 */

import { ActivityLevel } from '@prisma/client';

export interface BodyParams {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  activityLevel?: ActivityLevel;
}

/**
 * Calculate Body Mass Index (BMI)
 * Formula: weight(kg) / (height(m))^2
 */
export const calculateBMI = (weight: number, height: number): number => {
  const heightM = height / 100;
  return weight / (heightM * heightM);
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * More accurate than Harris-Benedict for modern populations
 */
export const calculateBMR = (params: BodyParams): number => {
  const { weight, height, age, gender } = params;
  
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

/**
 * Calculate daily calorie needs based on activity level
 * Uses standard activity multipliers:
 * 1.2 - Sedentary
 * 1.375 - Lightly active
 * 1.55 - Moderately active 
 * 1.725 - Very active
 * 1.9 - Extra active
 */
const getActivityMultiplier = (level: ActivityLevel): number => {
  switch(level) {
    case 'SEDENTARY': return 1.2;
    case 'LIGHTLY_ACTIVE': return 1.375;
    case 'MODERATELY_ACTIVE': return 1.55;
    case 'VERY_ACTIVE': return 1.725;
    case 'EXTREMELY_ACTIVE': return 1.9;
    default: return 1.2;
  }
};

export const getSuggestedCalories = (bmr: number, activityLevel: ActivityLevel = 'SEDENTARY'): number => {
  return Math.round(bmr * getActivityMultiplier(activityLevel));
};

/**
 * Get BMI category based on WHO standards
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Calculate healthy weight range based on BMI standards
 * Returns [minWeight, maxWeight] in kg
 */
export const getHealthyWeightRange = (height: number): [number, number] => {
  const heightM = height / 100;
  const lower = Math.round(18.5 * heightM * heightM * 10) / 10;
  const upper = Math.round(24.9 * heightM * heightM * 10) / 10;
  return [lower, upper];
};
