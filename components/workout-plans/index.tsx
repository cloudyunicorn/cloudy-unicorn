import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getFitnessResponse } from '@/lib/ai/chutes-client';
import { getWorkoutPrompt } from '@/lib/ai/fitness-prompts';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { saveWorkoutProgram } from '@/lib/actions/user.action';
import { useData } from '@/contexts/DataContext';
import { SavedWorkoutsList } from './SavedWorkoutsList';
import { toast } from 'sonner';

const WorkoutPlans = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  interface BodyMetrics {
    age?: number;
    weight?: number;
    height?: number;
    bodyFatPercentage?: number;
    gender?: string;
  }

  interface WorkoutContext {
    fitnessLevel: string;
    goals: string[];
    healthConditions: string[];
    currentPlan: {
      workouts: string[];
    };
    bodyMetrics: BodyMetrics;
  }

  const [context, setContext] = useState<WorkoutContext>({
    fitnessLevel: 'beginner',
    goals: ['general fitness'],
    healthConditions: [],
    currentPlan: {
      workouts: ['bodyweight'],
    },
    bodyMetrics: {},
  });

  const { data: userData, refetch } = useData();

  // Set context from user data
  if (userData?.profile && !context.bodyMetrics.age) {
    const profile = userData.profile;
    setContext({
      ...context,
      fitnessLevel: profile.fitnessLevel?.toLowerCase() || 'beginner',
      bodyMetrics: {
        age: profile.age ?? undefined,
        weight: profile.weight ?? undefined,
        height: profile.height ?? undefined,
        bodyFatPercentage: profile.bodyFatPercentage ?? undefined,
        gender: profile.gender ?? undefined,
      },
    });
  }

  const handleSaveWorkout = async () => {
    setIsSaving(true);
    try {
      const title = `Workout Plan ${new Date().toLocaleDateString()}`;
      const description = workoutPlan;
      const difficulty = context.fitnessLevel;

      const result = await saveWorkoutProgram(title, description, difficulty);
      if (result.error) {
        toast.error('Failed to save workout plan');
        console.error('Failed to save workout plan:', result.error);
      } else {
        await refetch();
        toast.success('Workout plan saved successfully!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetWorkout = async () => {
    setIsLoading(true);
    setWorkoutPlan('');
    try {
      const prompt = getWorkoutPrompt(context, query);
      const responseStream = getFitnessResponse(prompt, context);

      for await (const chunk of responseStream) {
        setWorkoutPlan((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Error getting workout plan:', error);
      setWorkoutPlan('Failed to get workout plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-full mt-6 p-1 mb-12 space-y-6 mx-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">AI Workout Planner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Fitness Level</Label>
            <Select
              value={context.fitnessLevel}
              onValueChange={(value) =>
                setContext({ ...context, fitnessLevel: value })
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select fitness level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Available Equipment</Label>
            <Input
              id="equipment"
              value={context.currentPlan.workouts.join(', ')}
              onChange={(e) => {
                setContext({
                  ...context,
                  currentPlan: {
                    ...context.currentPlan,
                    workouts: [e.target.value],
                  },
                });
              }}
              className="h-10"
              placeholder="E.g. dumbbells, resistance bands"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request">Your Request</Label>
            <Textarea
              id="request"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px]"
              placeholder="E.g. 'Suggest a 30-minute full body workout'"
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGetWorkout}
              disabled={isLoading}
              className="w-auto"
            >
              {isLoading ? 'Generating...' : 'Get Workout Plan'}
            </Button>
          </div>

          {workoutPlan && (
            <Card className="mt-6 relative">
              <CardHeader>
                <CardTitle className="text-lg">Suggested Workout</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={handleSaveWorkout}
                    variant="outline"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Plan'}
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-xl font-bold mt-6 mb-3"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-4" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5 mb-4" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <span className="font-semibold" {...props} />
                      ),
                      em: ({ node, ...props }) => (
                        <span className="italic" {...props} />
                      ),
                      hr: ({ node, ...props }) => (
                        <hr className="my-4 border-gray-200" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          className="text-blue-600 underline hover:text-blue-800"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {workoutPlan}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <SavedWorkoutsList onSave={refetch} />
    </div>
  );
};

export default WorkoutPlans;
