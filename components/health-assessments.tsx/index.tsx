import React from 'react';
import {
  calculateBMI,
  calculateBMR,
  getBMICategory,
  getHealthyWeightRange,
  getSuggestedCalories,
} from '@/utils/body-calculations';
import { Gender, ActivityLevel } from '@prisma/client';
import { BodyInfoDialog } from '../body-info-dialog';
import { useData } from '@/contexts/DataContext';

const HealthAssessments = () => {
  const { data: userData, isLoading, error } = useData();
  
  if (isLoading) return <div>Loading body metrics...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;
  if (
    !userData?.profile ||
    !userData.profile.weight ||
    !userData.profile.height ||
    !userData.profile.age ||
    !userData.profile.gender ||
    !userData.profile.activityLevel
  ) {
    return (
      <div className="flex flex-col justify-center items-center p-4">
        <div className="flex flex-col justify-center items-center p-4 font-bold">
          Complete your profile to see body metrics
        </div>
        <div className="flex justify-center">
          <BodyInfoDialog />
        </div>
      </div>
    );
  }

  const { weight, height, age, gender, activityLevel } = userData.profile;
  
  const bmi = calculateBMI(weight!, height!);
  // Convert Prisma enums to calculation-friendly formats
  const genderForCalc = gender?.toLowerCase() === 'male' ? 'male' : 'female';
  const bmr = calculateBMR({
    weight: weight!,
    height: height!,
    age: age!,
    gender: genderForCalc,
    activityLevel: activityLevel!,
  });
  const [minWeight, maxWeight] = getHealthyWeightRange(height!);
  const suggestedCalories = getSuggestedCalories(bmr, activityLevel!);

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold text-lg mb-2">Body Mass Index (BMI)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Your BMI</p>
            <p className="text-2xl font-bold">{bmi.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="text-2xl font-bold">{getBMICategory(bmi)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold text-lg mb-2">
          Basal Metabolic Rate (BMR)
        </h3>
        <p className="text-muted-foreground">
          Calories your body needs at rest
        </p>
        <p className="text-2xl font-bold">{bmr.toFixed(0)} kcal/day</p>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold text-lg mb-2">Suggested Daily Calories</h3>
        <p className="text-muted-foreground">Based on your activity level</p>
        <p className="text-2xl font-bold">
          {suggestedCalories.toFixed(0)} kcal/day
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold text-lg mb-2">Healthy Weight Range</h3>
        <p className="text-muted-foreground">For your height</p>
        <p className="text-2xl font-bold">
          {minWeight.toFixed(1)}kg - {maxWeight.toFixed(1)}kg
        </p>
      </div>
    </div>
  );
};

export default HealthAssessments;
