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

export const getSuggestedCalories = (
  bmr: number, 
  activityLevel: ActivityLevel = 'SEDENTARY',
  weightGoal: 'LOSE' | 'MAINTAIN' | 'GAIN' = 'MAINTAIN'
): number => {
  const baseCalories = Math.round(bmr * getActivityMultiplier(activityLevel));
  
  switch(weightGoal) {
    case 'LOSE':
      return baseCalories - 500;
    case 'GAIN':
      return baseCalories + 500;
    default: // MAINTAIN
      return baseCalories;
  }
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
 * Calculate precise healthy weight range based on WHO BMI standards
 * Uses BMI range of 18.5-24.9 for adults
 * Returns [minWeight, maxWeight] in kg with 1 decimal precision
 * 
 * @param height - Height in centimeters
 * @returns Tuple of [minHealthyWeight, maxHealthyWeight] in kilograms
 */
export const getHealthyWeightRange = (height: number): [number, number] => {
  const heightM = height / 100;
  const lower = 18.5 * heightM * heightM;
  const upper = 24.9 * heightM * heightM;
  return [
    Math.round(lower * 10) / 10, // Round to 1 decimal
    Math.round(upper * 10) / 10
  ];
};

/**
 * Calculate ideal body weight using Devine formula
 * Original formula:
 * - Men: 50 kg + 2.3 kg per inch over 5 feet
 * - Women: 45.5 kg + 2.3 kg per inch over 5 feet
 * 
 * @param height - Height in centimeters
 * @param gender - 'male' or 'female'
 * @returns Ideal weight in kilograms with 1 decimal precision
 */
export const getIdealBodyWeight = (height: number, gender: 'male' | 'female'): number => {
  const heightInches = height / 2.54; // Convert cm to inches
  let baseWeight = gender === 'male' ? 50 : 45.5;
  
  if (heightInches > 60) {
    baseWeight += 2.3 * (heightInches - 60);
  }
  
  return Math.round(baseWeight * 10) / 10;
};
