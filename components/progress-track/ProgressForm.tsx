import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

interface ProgressFormProps {
  onSuccess?: () => void;
}

const ProgressForm = ({ onSuccess }: ProgressFormProps) => {
  const { addProgressLog } = useData();
  const [type, setType] = useState('weight');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const metricOptions = [
    { value: 'weight', label: 'Weight', unit: 'kg' },
    { value: 'bodyFat', label: 'Body Fat', unit: '%' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert form types to Prisma enum values
      const prismaType = type === 'bodyFat' ? 'BODY_FAT' : type.toUpperCase();
      
      await addProgressLog({
        type: prismaType,
        value: parseFloat(value),
        notes: notes || undefined,
        date
      });
      
      toast.success('Progress saved successfully!');
      if (onSuccess) onSuccess();

      // Reset form
      setValue('');
      setNotes('');
      setDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-lg font-medium mb-4">Log Progress</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="metric-type">Metric</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {metricOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="value">
            Value ({metricOptions.find(m => m.value === type)?.unit})
          </Label>
          <Input
            id="value"
            type="number"
            step={type === 'bodyFat' ? '0.1' : '0.01'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details..."
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Saving...
            </span>
          ) : 'Save Progress'}
        </Button>
      </form>
    </div>
  );
};

export default ProgressForm;
