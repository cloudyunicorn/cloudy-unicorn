import React, { useEffect, useState } from 'react';
import {
  calculateBMI,
  calculateBMR,
  getBMICategory,
  getHealthyWeightRange,
  getSuggestedCalories,
  type BodyParams,
} from '@/utils/body-calculations';
import { getUserProfileAndGoals } from '@/lib/actions/user.action';

import { Gender, ActivityLevel } from '@prisma/client';
import { BodyInfoDialog } from '../body-info-dialog';

interface UserProfileData {
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: Gender | null;
  activityLevel: ActivityLevel | null;
}

const HealthAssessments = () => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserProfileAndGoals();
        if (!data?.profile) {
          throw new Error('Profile data not found');
        }
        setProfileData({
          weight: data.profile.weight,
          height: data.profile.height,
          age: data.profile.age,
          gender: data.profile.gender,
          activityLevel: data.profile.activityLevel,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch profile data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading body metrics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (
    !profileData ||
    !profileData.weight ||
    !profileData.height ||
    !profileData.age ||
    !profileData.gender ||
    !profileData.activityLevel
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

  const { weight, height, age, gender, activityLevel } = profileData;
  const bmi = calculateBMI(weight, height);
  // Convert Prisma enums to calculation-friendly formats
  const genderForCalc = gender?.toLowerCase() === 'male' ? 'male' : 'female';
  const bmr = calculateBMR({
    weight,
    height,
    age,
    gender: genderForCalc,
    activityLevel,
  });
  const [minWeight, maxWeight] = getHealthyWeightRange(height);
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
