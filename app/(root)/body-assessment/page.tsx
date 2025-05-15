"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ActivityLevel } from '@prisma/client';
import { 
  calculateBMI, 
  calculateBMR, 
  getBMICategory, 
  getHealthyWeightRange,
  getSuggestedCalories,
  getIdealBodyWeight
} from '@/utils/body-calculations';

export default function BodyAssessmentPage() {
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [healthyWeight, setHealthyWeight] = useState<[number, number]>([0, 0]);
  const [idealWeight, setIdealWeight] = useState<number | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [weightGoal, setWeightGoal] = useState<'LOSE' | 'MAINTAIN' | 'GAIN'>('MAINTAIN');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const height = Number(formData.get('height'));
    const weight = Number(formData.get('weight'));
    const age = Number(formData.get('age'));
    const gender = formData.get('gender') as string;
    const activityLevel = formData.get('activityLevel') as string;

    const calculatedBmi = calculateBMI(weight, height);
    const calculatedBmr = calculateBMR({ weight, height, age, gender: gender as 'male' | 'female' });
    const healthyRange = getHealthyWeightRange(height);
    const suggestedCalories = getSuggestedCalories(
      calculatedBmr, 
      activityLevel as ActivityLevel,
      weightGoal
    );
    const ideal = getIdealBodyWeight(height, gender as 'male' | 'female');

    setBmi(calculatedBmi);
    setBmr(calculatedBmr);
    setHealthyWeight(healthyRange);
    setIdealWeight(ideal);
    setCalories(suggestedCalories);
    setShowResults(true);
  };


  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Free Body Assessment</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input 
            id="height" 
            name="height" 
            type="number" 
            required 
            min="100" 
            max="250" 
            placeholder="Enter your height"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input 
            id="weight" 
            name="weight" 
            type="number" 
            required 
            min="30" 
            max="300" 
            placeholder="Enter your weight"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input 
            id="age" 
            name="age" 
            type="number" 
            required 
            min="12" 
            max="120" 
            placeholder="Enter your age"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select name="gender" required>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activityLevel">Activity Level</Label>
          <Select name="activityLevel" required>
            <SelectTrigger>
              <SelectValue placeholder="Select activity level" />
            </SelectTrigger>
            <SelectContent>
          <SelectItem value="SEDENTARY">Sedentary (little or no exercise)</SelectItem>
          <SelectItem value="LIGHTLY_ACTIVE">Light exercise (1-3 days/week)</SelectItem>
          <SelectItem value="MODERATELY_ACTIVE">Moderate exercise (3-5 days/week)</SelectItem>
          <SelectItem value="VERY_ACTIVE">Active (6-7 days/week)</SelectItem>
          <SelectItem value="EXTREMELY_ACTIVE">Very active (hard exercise & physical job)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weightGoal">Weight Goal</Label>
          <Select 
            name="weightGoal" 
            required
            value={weightGoal}
            onValueChange={(value) => setWeightGoal(value as 'LOSE' | 'MAINTAIN' | 'GAIN')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select weight goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOSE">Lose Weight</SelectItem>
              <SelectItem value="MAINTAIN">Maintain Weight</SelectItem>
              <SelectItem value="GAIN">Gain Muscle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          Calculate
        </Button>
      </form>

      {showResults && bmi && bmr && calories && (
        <div className="mt-8 p-4 rounded-lg bg-muted/50 space-y-3">
          <h3 className="text-xl font-bold mb-4">Your Body Assessment</h3>
          <div>
            <p className="font-medium">BMI:</p>
            <p>{bmi.toFixed(1)} ({getBMICategory(bmi)})</p>
          </div>
          <div>
            <p className="font-medium">Healthy Weight Range:</p>
            <p>{healthyWeight[0].toFixed(1)}kg - {healthyWeight[1].toFixed(1)}kg</p>
          </div>
          <div>
            <p className="font-medium">Ideal Body Weight:</p>
            <p>{idealWeight?.toFixed(1)}kg</p>
          </div>
          <div>
            <p className="font-medium">Basal Metabolic Rate (BMR):</p>
            <p>{bmr.toFixed(0)} calories/day</p>
          </div>
          <div>
            <p className="font-medium">Suggested Daily Calories ({{
              LOSE: 'Weight Loss',
              MAINTAIN: 'Weight Maintenance',
              GAIN: 'Weight Gain'
            }[weightGoal]}):</p>
            <p>{calories.toFixed(0)} calories/day</p>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            Note: This assessment is not saved as you're not signed in
          </p>
        </div>
      )}
    </div>
  );
}
