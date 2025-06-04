'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalorie } from '@/contexts/CalorieContext';
import { MealType } from '@prisma/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

export function CalorieLogForm() {
  const { user } = useUser();
  const { addCalorie } = useCalorie();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    food: string;
    calories: string;
    mealType: MealType;
    notes: string;
    date: string;
  }>({
    food: '',
    calories: '',
    mealType: MealType.BREAKFAST,
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: MealType) => {
    setFormData((prev) => ({
      ...prev,
      mealType: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('food', formData.food);
      formDataObj.append('calories', formData.calories.toString());
      formDataObj.append('mealType', formData.mealType);
      formDataObj.append('notes', formData.notes);
      formDataObj.append('date', formData.date);

      await addCalorie(formDataObj);
      toast.success('Calories logged successfully!');
      
      // Reset form
      setFormData({
        food: '',
        calories: '',
        mealType: MealType.BREAKFAST,
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error('Failed to log calories. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="food">Food Name</Label>
        <Input
          id="food"
          name="food"
          value={formData.food}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            name="calories"
            type="number"
            min="0"
            value={formData.calories}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="mealType">Meal Type</Label>
          <Select
            onValueChange={handleSelectChange}
            value={formData.mealType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MealType.BREAKFAST}>
                Breakfast
              </SelectItem>
              <SelectItem value={MealType.LUNCH}>Lunch</SelectItem>
              <SelectItem value={MealType.DINNER}>Dinner</SelectItem>
              <SelectItem value={MealType.SNACK}>Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging...' : 'Log Calories'}
      </Button>
    </form>
  );
}
