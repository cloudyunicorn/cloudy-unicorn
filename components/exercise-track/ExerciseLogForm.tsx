'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { logExercise } from '@/lib/actions/exercise.action';
import { useState } from 'react';
import { useExercise } from '@/contexts/ExerciseContext';

export function ExerciseLogForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addExercise } = useExercise();
  const [formData, setFormData] = useState({
    exerciseName: '',
    reps: '',
    weight: '',
    sets: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    form.append('exerciseName', formData.exerciseName);
    form.append('reps', String(Number(formData.reps)));
    form.append('weight', String(Number(formData.weight)));
    form.append('sets', String(Number(formData.sets)));
    form.append('notes', formData.notes || '');
    form.append('date', formData.date);

    try {
      const result = await logExercise(form);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Exercise logged successfully!');
        // Add exercise to context
        addExercise({
          name: formData.exerciseName,
          reps: Number(formData.reps),
          weight: Number(formData.weight),
          sets: Number(formData.sets),
          notes: formData.notes || '',
          date: new Date(formData.date)
        });
        // Reset form
        setFormData({
          exerciseName: '',
          reps: '',
          weight: '',
          sets: '',
          notes: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      toast.error('Failed to log exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="exerciseName">Exercise Name</Label>
        <Input
          id="exerciseName"
          name="exerciseName"
          value={formData.exerciseName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sets">Sets</Label>
          <Input
            id="sets"
            name="sets"
            type="number"
            min="1"
            value={formData.sets}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="reps">Reps</Label>
          <Input
            id="reps"
            name="reps"
            type="number"
            min="1"
            value={formData.reps}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            min="0"
            step="0.1"
            value={formData.weight}
            onChange={handleChange}
            required
          />
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
        {isSubmitting ? 'Logging...' : 'Log Exercise'}
      </Button>
    </form>
  );
}
