'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getBodyAssessmentPrompt } from '@/lib/ai/fitness-prompts';
import { getFitnessResponse } from '@/lib/ai/chutes-client';
import { type ActivityLevel } from '@prisma/client';
import {
  calculateBMI,
  calculateBMR,
  getBMICategory,
  getHealthyWeightRange,
  getSuggestedCalories,
  getIdealBodyWeight,
} from '@/utils/body-calculations';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import Link from 'next/link';

export default function BodyAssessmentPage() {
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [healthyWeight, setHealthyWeight] = useState<[number, number]>([0, 0]);
  const [idealWeight, setIdealWeight] = useState<number | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [weightGoal, setWeightGoal] = useState<'LOSE' | 'MAINTAIN' | 'GAIN'>(
    'MAINTAIN'
  );
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastAIRefresh, setLastAIRefresh] = useState<number>(0);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const height = Number(formData.get('height'));
    const weight = Number(formData.get('weight'));
    const age = Number(formData.get('age'));
    const gender = formData.get('gender') as string;
    const activityLevel = formData.get('activityLevel') as string;

    const calculatedBmi = calculateBMI(weight, height);
    const calculatedBmr = calculateBMR({
      weight,
      height,
      age,
      gender: gender as 'male' | 'female',
    });
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

    // Get AI recommendations with rate limiting
    const now = Date.now();
    if (now - lastAIRefresh < 60000) { // 60 seconds
      setAiResponse('AI recommendations are rate limited to 1 request per minute. Please wait.');
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    try {
      setLastAIRefresh(now);
      const context = {
        bodyMetrics: {
          age,
          gender: gender as 'male' | 'female',
          weight,
          height,
          targetWeight:
            weightGoal === 'LOSE'
              ? weight * 0.9
              : weightGoal === 'GAIN'
                ? weight * 1.1
                : weight,
        },
        goals: [
          weightGoal === 'LOSE'
            ? 'weight loss'
            : weightGoal === 'GAIN'
              ? 'muscle gain'
              : 'maintenance',
        ],
        fitnessLevel: activityLevel,
        healthConditions: [],
        diet: '',
      };

      const prompt = getBodyAssessmentPrompt(
        context,
        'Please analyze my body metrics and provide recommendations'
      );

      let fullResponse = '';
      for await (const chunk of getFitnessResponse(prompt, context)) {
        fullResponse += chunk;
        setAiResponse(fullResponse);
      }
    } catch (error) {
      setAiResponse('Could not get AI recommendations at this time.');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Free Body Assessment
      </h1>
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
              <SelectItem value="SEDENTARY">
                Sedentary (little or no exercise)
              </SelectItem>
              <SelectItem value="LIGHTLY_ACTIVE">
                Light exercise (1-3 days/week)
              </SelectItem>
              <SelectItem value="MODERATELY_ACTIVE">
                Moderate exercise (3-5 days/week)
              </SelectItem>
              <SelectItem value="VERY_ACTIVE">
                Active (6-7 days/week)
              </SelectItem>
              <SelectItem value="EXTREMELY_ACTIVE">
                Very active (hard exercise & physical job)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weightGoal">Weight Goal</Label>
          <Select
            name="weightGoal"
            required
            value={weightGoal}
            onValueChange={(value) =>
              setWeightGoal(value as 'LOSE' | 'MAINTAIN' | 'GAIN')
            }
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
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-[90vw] md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle>Your Body Assessment</DialogTitle>
                <DialogDescription>
                  Here is your initial body assessment by our AI
                </DialogDescription>
              </DialogHeader>
              <div>
                <p className="font-medium">BMI:</p>
                <p>
                  {bmi.toFixed(1)} ({getBMICategory(bmi)})
                </p>
              </div>
              <div>
                <p className="font-medium">Healthy Weight Range:</p>
                <p>
                  {healthyWeight[0].toFixed(1)}kg -{' '}
                  {healthyWeight[1].toFixed(1)}kg
                </p>
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
                <p className="font-medium">
                  Suggested Daily Calories (
                  {
                    {
                      LOSE: 'Weight Loss',
                      MAINTAIN: 'Weight Maintenance',
                      GAIN: 'Weight Gain',
                    }[weightGoal]
                  }
                  ):
                </p>
                <p>{calories.toFixed(0)} calories/day</p>
              </div>
              <p className="text-sm text-muted-foreground pt-4">
                Note: This assessment is not saved as you're not signed in
              </p>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isStreaming && !aiResponse && (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  )}
                  {aiResponse && !aiResponse.startsWith('AI recommendations are rate limited') && (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h3: (props) => (
                            <h3
                              className="text-xl font-bold mt-6 mb-3"
                              {...props}
                            />
                          ),
                          p: (props) => <p className="mb-4" {...props} />,
                          ul: (props) => (
                            <ul className="list-disc pl-5 mb-4" {...props} />
                          ),
                          li: (props) => <li className="mb-1" {...props} />,
                          strong: (props) => (
                            <span className="font-semibold" {...props} />
                          ),
                          em: (props) => <span className="italic" {...props} />,
                          hr: (props) => (
                            <hr className="my-4 border-gray-200" {...props} />
                          ),
                        }}
                      >
                        {aiResponse}
                      </ReactMarkdown>
                    </div>
                  )}
                  {aiResponse.startsWith('AI recommendations are rate limited') && (
                    <div className="prose prose-sm max-w-none text-red-600">
                      {aiResponse}
                    </div>
                  )}
                  <div className="flex justify-center mt-4">
                    <Button>
                      <Link href="/sign-up">Sign Up</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
