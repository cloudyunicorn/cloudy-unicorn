'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getExerciseHistory } from '@/lib/actions/exercise.action';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ExerciseLog {
  exerciseId: string;
  name: string;
  reps: number;
  weight: number;
  sets: number;
  notes?: string;
  date: Date;
  sessionId: string;
}

export function ExerciseHistory() {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await getExerciseHistory();
        if (result?.logs) {
          setLogs(result.logs.map(log => ({
            ...log,
            date: new Date(log.date)
          })));
        }
      } catch (error) {
        console.error('Failed to fetch exercise history', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Loading history...</div>;
  }

  if (logs.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No exercise history found</div>;
  }

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const dateKey = format(log.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(log);
    return acc;
  }, {} as Record<string, ExerciseLog[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => (
        <Card key={date}>
          <CardHeader>
            <CardTitle>{format(new Date(date), 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exercise</TableHead>
                  <TableHead>Sets</TableHead>
                  <TableHead>Reps</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dateLogs.map((log, index) => (
                  <TableRow key={`${date}-${index}`}>
                    <TableCell className="font-medium">{log.name}</TableCell>
                    <TableCell>{log.sets}</TableCell>
                    <TableCell>{log.reps}</TableCell>
                    <TableCell>{log.weight}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
