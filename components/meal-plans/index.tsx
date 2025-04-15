import React, { useState } from 'react'
import { getFitnessResponse } from '@/lib/ai/chutes-client'
import { getMealPrompt } from '@/lib/ai/fitness-prompts'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const MealPlans = () => {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mealSuggestions, setMealSuggestions] = useState('')
  const [context, setContext] = useState({
    diet: 'balanced',
    goals: ['weight maintenance'],
    fitnessLevel: 'beginner',
    healthConditions: []
  })

  const handleGetSuggestions = async () => {
    setIsLoading(true)
    try {
      const prompt = getMealPrompt(context, query)
      const response = await getFitnessResponse(prompt, context)
      setMealSuggestions(response)
    } catch (error) {
      console.error('Error getting meal suggestions:', error)
      setMealSuggestions('Failed to get suggestions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
            onChange={(e) => setContext({...context, diet: e.target.value})}
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
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Suggested Meal Plan</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap p-6">
              {mealSuggestions}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export default MealPlans
