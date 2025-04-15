import React, { useState, useEffect } from 'react';
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
import { getUserProfileAndGoals } from '@/lib/actions/user.action';

const WorkoutPlans = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState('');
  const [context, setContext] = useState({
    fitnessLevel: 'beginner',
    goals: ['general fitness'],
    healthConditions: [],
    currentPlan: {
      workouts: ['bodyweight'],
    },
    bodyMetrics: {},
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserProfileAndGoals();
        if (userData?.profile) {
          const profile = userData.profile;
          setContext((prev) => ({
            ...prev,
            fitnessLevel: profile.fitnessLevel?.toLowerCase() || 'beginner',
            bodyMetrics: {
              age: profile.age ?? undefined,
              weight: profile.weight ?? undefined,
              height: profile.height ?? undefined,
              bodyFatPercentage: profile.bodyFatPercentage ?? undefined,
              gender: profile.gender ?? undefined,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleGetWorkout = async () => {
    setIsLoading(true);
    setWorkoutPlan('');
    try {
      const prompt = getWorkoutPrompt(context, query);
      const responseStream = getFitnessResponse(prompt, context);
      
      for await (const chunk of responseStream) {
        setWorkoutPlan(prev => prev + chunk);
      }
    } catch (error) {
      console.error('Error getting workout plan:', error);
      setWorkoutPlan('Failed to get workout plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start h-full mt-10 p-1 mb-12">
      <Card className="max-w-2xl mx-auto">
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
              onChange={(e) =>
                setContext({
                  ...context,
                  currentPlan: {
                    ...context.currentPlan,
                    workouts: e.target.value
                      .split(',')
                      .map((item) => item.trim()),
                  },
                })
              }
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

          <Button
            onClick={handleGetWorkout}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Get Workout Plan'}
          </Button>

          {workoutPlan && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Suggested Workout</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
    </div>
  );
};

export default WorkoutPlans;
