'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { UserCog } from 'lucide-react';
import { FitnessGoal, DifficultyLevel, Gender } from '@prisma/client';
import { updateUserProfileAndGoals, getUserProfileAndGoals } from '@/lib/actions/user.action';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const fitnessGoalEnum = FitnessGoal || {
  WEIGHT_LOSS: 'WEIGHT_LOSS',
  MUSCLE_GAIN: 'MUSCLE_GAIN',
  MAINTENANCE: 'MAINTENANCE',
  ENDURANCE: 'ENDURANCE',
  FLEXIBILITY: 'FLEXIBILITY',
};
const difficultyLevelEnum = DifficultyLevel || {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
};

const bodyInfoSchema = z.object({
  age: z.coerce.number().int().positive().optional().nullable(),
  weight: z.coerce.number().positive().optional().nullable(),
  height: z.coerce.number().positive().optional().nullable(),
  bodyFatPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  dietaryPreferences: z.string().optional().nullable(),
  fitnessLevel: z.nativeEnum(difficultyLevelEnum).optional().nullable(),
  targetWeight: z.coerce.number().positive().optional().nullable(),
  goals: z.array(z.nativeEnum(fitnessGoalEnum)).min(1, 'Select at least one goal'),
});

type BodyInfoFormData = z.infer<typeof bodyInfoSchema>;

type UserProfileGoalsData = {
  goals: FitnessGoal[];
  profile: {
    age: number | null;
    weight: number | null;
    height: number | null;
    bodyFatPercentage: number | null;
    gender: Gender | null;
    dietaryPreferences: string[];
    fitnessLevel: DifficultyLevel | null;
    targetWeight: number | null;
  } | null;
} | null;

export function BodyInfoDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [initialData, setInitialData] = useState<UserProfileGoalsData>(null);

  const form = useForm<BodyInfoFormData>({
    resolver: zodResolver(bodyInfoSchema),
    defaultValues: {
      goals: [],
      dietaryPreferences: '',
      age: undefined,
      weight: undefined,
      height: undefined,
      bodyFatPercentage: undefined,
      fitnessLevel: undefined,
      targetWeight: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      const fetchInitialData = async () => {
        setIsLoadingData(true);
        setInitialData(null);
        form.reset();
        try {
          const data: UserProfileGoalsData = await getUserProfileAndGoals();
          setInitialData(data);

          if (data) {
            form.reset({
              age: data.profile?.age ?? undefined,
              weight: data.profile?.weight ?? undefined,
              height: data.profile?.height ?? undefined,
              bodyFatPercentage: data.profile?.bodyFatPercentage ?? undefined,
              gender: data.profile?.gender ?? undefined,
              dietaryPreferences: data.profile?.dietaryPreferences?.join(', ') ?? '',
              fitnessLevel: data.profile?.fitnessLevel ?? undefined,
              targetWeight: data.profile?.targetWeight ?? undefined,
              goals: data.goals ?? [],
            });
          }
        } catch (error) {
          console.error("Failed to fetch initial body info:", error);
          toast.error("Could not load your current body info.");
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchInitialData();
    }
  }, [isOpen, form]);

  async function onSubmit(values: BodyInfoFormData) {
    setIsSubmitting(true);
    try {
      const result = await updateUserProfileAndGoals(values);

      if (result?.error) {
        console.error("Failed to update profile:", result.error, result.details);
        toast.error(`Failed to update profile: ${result.error}`);
      } else {
        toast.success('Profile updated successfully!');
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Unexpected error during profile update:", error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
       setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
         <Button variant="ghost" className="w-full justify-start items-center gap-2 px-3">
            <UserCog size={20} />
            <span className="group-data-[collapsible=true]/sidebar-wrapper:opacity-0 group-data-[collapsible=true]/sidebar-wrapper:w-0 group-data-[collapsible=true]/sidebar-wrapper:transition-none">
              Body Info +
            </span>
         </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Body Information & Goals</DialogTitle>
          <DialogDescription>
            {isLoadingData ? 'Loading...' : (initialData?.profile ? 'Review or update' : 'Provide')} your current body metrics and fitness goals.
          </DialogDescription>
        </DialogHeader>
        {isLoadingData ? (
          <div className="space-y-6 py-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
             </div>
             <div>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                </div>
             </div>
             <div className="flex justify-end gap-2 pt-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
             </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="Your age" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 175.5" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 70.2" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="targetWeight" render={({ field }) => (<FormItem><FormLabel>Target Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Optional" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="bodyFatPercentage" render={({ field }) => (<FormItem><FormLabel>Body Fat (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="Optional" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Estimate if unsure.</FormDescription><FormMessage /></FormItem>)} />

                <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Gender).map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender.charAt(0) + gender.slice(1).toLowerCase().replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="fitnessLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your fitness level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(difficultyLevelEnum).map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0) + level.slice(1).toLowerCase().replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="dietaryPreferences" render={({ field }) => (<FormItem><FormLabel>Dietary Preferences</FormLabel><FormControl><Input placeholder="e.g., Vegetarian, Gluten-Free" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Separate preferences with commas.</FormDescription><FormMessage /></FormItem>)} />
              </div>

              <FormField control={form.control} name="goals" render={() => (
                  <FormItem>
                    <div className="mb-4"><FormLabel className="text-base">Fitness Goals</FormLabel><FormDescription>Select one or more goals.</FormDescription></div>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.values(fitnessGoalEnum).map((goal) => (
                        <FormField key={goal} control={form.control} name="goals" render={({ field }) => (
                            <FormItem key={goal} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value?.includes(goal)} onCheckedChange={(checked) => {
                                    const currentGoals = field.value || [];
                                    return checked ? field.onChange([...currentGoals, goal]) : field.onChange(currentGoals.filter((value) => value !== goal));
                                  }} />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">{goal.replace(/_/g, ' ').toLowerCase()}</FormLabel>
                            </FormItem>
                        )} />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || isLoadingData}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
