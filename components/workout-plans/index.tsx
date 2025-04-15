import React, { useState } from 'react'
import { getFitnessResponse } from '@/lib/ai/chutes-client'
import { getWorkoutPrompt } from '@/lib/ai/fitness-prompts'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

const WorkoutPlans = () => {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [workoutPlan, setWorkoutPlan] = useState('')
  const [context, setContext] = useState({
    fitnessLevel: 'beginner',
    goals: ['general fitness'],
    healthConditions: [],
    currentPlan: {
      workouts: ['bodyweight']
    }
  })

  const handleGetWorkout = async () => {
    setIsLoading(true)
    try {
      const prompt = getWorkoutPrompt(context, query)
      const response = await getFitnessResponse(prompt, context)
      setWorkoutPlan(response)
    } catch (error) {
      console.error('Error getting workout plan:', error)
      setWorkoutPlan('Failed to get workout plan. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">AI Workout Planner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Fitness Level</Label>
          <Select
            value={context.fitnessLevel}
            onValueChange={(value) => setContext({...context, fitnessLevel: value})}
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
            onChange={(e) => setContext({
              ...context,
              currentPlan: {
                ...context.currentPlan,
                workouts: e.target.value.split(',').map(item => item.trim())
              }
            })}
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
            <CardContent className="whitespace-pre-wrap p-6">
              {workoutPlan}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export default WorkoutPlans
