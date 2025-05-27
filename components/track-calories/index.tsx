'use client';

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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { MealType } from '@prisma/client';
import { logCalorie } from '@/lib/actions/calorie.action';
import { useUser } from '@/contexts/UserContext';
import { getUserId } from '@/lib/actions/user.action';

export function TrackCalories() {
  const { user } = useUser();
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
      const result = await logCalorie({
        food: formData.food,
        calories: Number(formData.calories),
        mealType: formData.mealType,
        notes: formData.notes,
        date: formData.date,
        userId: user?.id || (await getUserId()),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to log calories');
      }

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
      toast.error('Failed to log calories');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-full mt-6 p-1 mb-12 space-y-6 mx-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Track Calories</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
