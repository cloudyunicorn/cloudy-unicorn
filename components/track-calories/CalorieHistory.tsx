'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCalorie, type CalorieLog } from '@/contexts/CalorieContext';
import { useData } from '@/contexts/DataContext';
import { getSuggestedCalories, calculateBMR } from '@/utils/body-calculations';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function getDailySuggestedCalories(profile: any) {
  if (
    !profile?.weight ||
    !profile?.height ||
    !profile?.age ||
    !profile?.gender ||
    !profile?.activityLevel
  ) {
    return null;
  }

  return;
}

export function CalorieHistory() {
  const { calorieHistory: logs, isLoading } = useCalorie();
  const { data: userData } = useData();

  if (isLoading || !userData?.profile) {
    return <div className="text-center py-4">Loading history...</div>;
  }
  const { weight, height, age, gender, activityLevel, targetWeight } =
    userData.profile;

  const bmr = calculateBMR({
    weight: weight!,
    height: height!,
    age: age!,
    gender: gender!.toLowerCase() === 'male' ? 'male' : 'female',
    activityLevel: activityLevel!,
  });

  let weightGoal: 'LOSE' | 'MAINTAIN' | 'GAIN' = 'MAINTAIN';
  if (targetWeight && weight) {
    const weightDifference = targetWeight - weight;
    if (weightDifference < -2) {
      weightGoal = 'LOSE';
    } else if (weightDifference > 2) {
      weightGoal = 'GAIN';
    }
  }

  const dailyCals = getSuggestedCalories(
    bmr,
    activityLevel!,
    weightGoal
  ).toFixed(0);

  if (logs.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No calorie history found
      </div>
    );
  }

  // Group logs by date
  const groupedLogs = logs.reduce<Record<string, CalorieLog[]>>(
    (acc, log) => {
      const dateKey = format(log.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(log);
      return acc;
    },
    {} as Record<string, CalorieLog[]>
  );

  console.log(groupedLogs);

  return (
    <div className="space-y-4">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => (
        <Card key={date}>
          <CardHeader>
            <CardTitle>{format(new Date(date), 'MMMM d, yyyy')}</CardTitle>
            <div className="space-y-1">
              <p>
                Consumed:{' '}
                <span>
                  {dateLogs.reduce((sum, log) => sum + log.calories, 0)}
                </span>{' '}
                /{' '}
                {userData?.profile && (
                  <span className="font-bold">{dailyCals} kcal</span>
                )}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full">
              <Table className="w-full overflow-x-hidden">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pr-0">Food</TableHead>
                    <TableHead className="p-0">Calories</TableHead>
                    <TableHead className="p-0">Meal Type</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dateLogs.map((log, index) => (
                    <TableRow key={`${date}-${index}`}>
                      <TableCell className="font-medium pr-0">
                        {log.food}
                      </TableCell>
                      <TableCell className="p-0">{log.calories}</TableCell>
                      <TableCell className="p-0">{log.mealType}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <Dialog>
                          <DialogTitle></DialogTitle>
                          <DialogTrigger className="hover:underline">
                            {log.notes
                              ? `${log.notes.split(' ').slice(0, 2).join(' ')}${log.notes.split(' ').length > 2 ? '...' : ''}`
                              : '-'}
                          </DialogTrigger>
                          <DialogContent className="w-3/4 rounded-md">
                            <p className="whitespace-pre-wrap">{log.notes}</p>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
