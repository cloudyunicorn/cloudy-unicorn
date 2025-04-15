import React, { useState } from 'react'
import { getFitnessResponse } from '@/lib/ai/chutes-client'
import { getHabitPrompt } from '@/lib/ai/fitness-prompts'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const Habits = () => {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [habitSuggestions, setHabitSuggestions] = useState('')
  const [context, setContext] = useState({
    fitnessLevel: 'moderate',
    goals: ['improve sleep', 'reduce stress'],
    healthConditions: []
  })

  const handleGetHabits = async () => {
    setIsLoading(true)
    try {
      const prompt = getHabitPrompt(context, query)
      const response = await getFitnessResponse(prompt, context)
      setHabitSuggestions(response)
    } catch (error) {
      console.error('Error getting habit suggestions:', error)
      setHabitSuggestions('Failed to get suggestions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
            onChange={(e) => setContext({
              ...context,
              goals: e.target.value.split(',').map(item => item.trim())
            })}
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
            <CardContent className="whitespace-pre-wrap p-6">
              {habitSuggestions}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export default Habits
