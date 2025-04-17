import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getFitnessResponse } from '@/lib/ai/chutes-client';
import { getHabitPrompt } from '@/lib/ai/fitness-prompts';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';

const Habits = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [habitSuggestions, setHabitSuggestions] = useState('');
  interface BodyMetrics {
    age?: number;
    weight?: number;
    targetWeight?: number;
  }

  interface HabitContext {
    fitnessLevel: string;
    goals: string[];
    healthConditions: string[];
    bodyMetrics: BodyMetrics;
  }

  const [context, setContext] = useState<HabitContext>({
    fitnessLevel: 'moderate',
    goals: ['improve sleep', 'reduce stress'],
    healthConditions: [],
    bodyMetrics: {},
  });

  const { data: userData } = useData();
  
  // Set context from user data
  if (userData?.profile && !context.bodyMetrics.age) {
    const profile = userData.profile;
    setContext({
      ...context,
      fitnessLevel: profile.fitnessLevel?.toLowerCase() || 'moderate',
      goals: userData.goals?.map((g) =>
        g.toLowerCase().replace(/_/g, ' ')
      ) || ['improve sleep', 'reduce stress'],
      bodyMetrics: {
        age: profile.age ?? undefined,
        weight: profile.weight ?? undefined,
        targetWeight: profile.targetWeight ?? undefined,
      },
    });
  }

  const handleGetHabits = async () => {
    setIsLoading(true);
    setHabitSuggestions('');
    try {
      const prompt = getHabitPrompt(context, query);
      const responseStream = getFitnessResponse(prompt, context);
      
      for await (const chunk of responseStream) {
        setHabitSuggestions(prev => prev + chunk);
      }
    } catch (error) {
      console.error('Error getting habit suggestions:', error);
      setHabitSuggestions('Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start h-full mt-10 p-1 mb-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">AI Habit Coach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goals">Current Goals</Label>
            <Input
              id="goals"
              value={context.goals.join(', ')}
              onChange={(e) =>
                setContext({
                  ...context,
                  goals: e.target.value.split(',').map((item) => item.trim()),
                })
              }
              className="h-10"
              placeholder="E.g. better sleep, more exercise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request">Your Request</Label>
            <Textarea
              id="request"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px]"
              placeholder="E.g. 'Suggest habits to improve my morning routine'"
            />
          </div>

          <Button
            onClick={handleGetHabits}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Get Habit Suggestions'}
          </Button>

          {habitSuggestions && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Suggested Habits</CardTitle>
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
                    {habitSuggestions}
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

export default Habits;
