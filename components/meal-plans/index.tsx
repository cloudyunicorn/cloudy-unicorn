import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getFitnessResponse } from '@/lib/ai/chutes-client';
import { getMealPrompt } from '@/lib/ai/fitness-prompts';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getUserProfileAndGoals, saveMealPlan } from '@/lib/actions/user.action';
import { MealPlansList, type MealPlan } from './MealPlansList';
import { toast } from 'sonner';

const MealPlans = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mealSuggestions, setMealSuggestions] = useState('');
  const [context, setContext] = useState({
    diet: 'balanced',
    goals: ['weight maintenance'],
    fitnessLevel: 'beginner',
    healthConditions: [],
    bodyMetrics: {},
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const title = `Meal Plan ${new Date().toLocaleDateString()}`;
      const description = mealSuggestions;
      const calories = 2000; // Default value, can be calculated from context
      const tags = context.diet.split(',')
        .map(t => t.trim())
        .filter(t => t !== '');
      
      const result = await saveMealPlan(title, description, calories, tags);
      if (result.error) {
        toast.error('Failed to save meal plan');
        console.error('Failed to save meal plan:', result.error);
      } else {
        toast.success('Meal plan saved successfully!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserProfileAndGoals();
        if (userData?.profile) {
          const profile = userData.profile;
          setContext((prev) => ({
            ...prev,
            diet: profile.dietaryPreferences?.join(', ') || 'balanced',
            fitnessLevel: profile.fitnessLevel?.toLowerCase() || 'beginner',
            bodyMetrics: {
              age: profile.age ?? undefined,
              weight: profile.weight ?? undefined,
              height: profile.height ?? undefined,
              bodyFatPercentage: profile.bodyFatPercentage ?? undefined,
              gender: profile.gender ?? undefined,
              targetWeight: profile.targetWeight ?? undefined,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setMealSuggestions('');
    try {
      const prompt = getMealPrompt(context, query);
      const responseStream = getFitnessResponse(prompt, context);

      for await (const chunk of responseStream) {
        setMealSuggestions((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Error getting meal suggestions:', error);
      setMealSuggestions('Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-full mt-10 p-1 mb-12 space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">AI Meal Planner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="diet">Dietary Preferences</Label>
            <Input
              id="diet"
              value={context.diet}
              onChange={(e) => {
                setContext({ 
                  ...context, 
                  diet: e.target.value 
                });
              }}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request">Your Request</Label>
            <Textarea
              id="request"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px]"
              placeholder="E.g. 'Suggest high-protein breakfast options'"
            />
          </div>

          <Button
            onClick={handleGetSuggestions}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Get Meal Suggestions'}
          </Button>

          {mealSuggestions && (
            <Card className="mt-6 relative">
              <CardHeader>
                <CardTitle className="text-lg">Suggested Meal Plan</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-end mb-4">
                    <Button 
                      onClick={handleSavePlan}
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
                    }}
                  >
                    {mealSuggestions}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <MealPlansList />
    </div>
  );
};

export default MealPlans;
