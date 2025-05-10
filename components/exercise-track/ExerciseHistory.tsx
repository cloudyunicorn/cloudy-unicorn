'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useExercise, type ExerciseLog } from '@/contexts/ExerciseContext';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

export function ExerciseHistory() {
  const { exerciseHistory: logs, isLoading } = useExercise();

  if (isLoading) {
    return <div className="text-center py-4">Loading history...</div>;
  }

  if (logs.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No exercise history found</div>;
  }

  // Group logs by date
  const groupedLogs = logs.reduce<Record<string, ExerciseLog[]>>((acc, log) => {
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
            <div className="w-fit md:w-full">
              <Table className="w-full">
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
                        <Dialog>
                          <DialogTitle></DialogTitle>
                          <DialogTrigger className="hover:underline">
                            {log.notes ? 
                              `${log.notes.split(' ').slice(0, 2).join(' ')}${log.notes.split(' ').length > 2 ? '...' : ''}` 
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
