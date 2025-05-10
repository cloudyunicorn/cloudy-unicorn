'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExerciseLogForm } from './ExerciseLogForm';
import { ExerciseHistory } from './ExerciseHistory';
import { ExerciseProvider } from '@/contexts/ExerciseContext';

export function ExerciseTrack() {
  return (
    <ExerciseProvider>
      <div className="space-y-4 p-4">
      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="log">Log Exercise</TabsTrigger>
          <TabsTrigger value="history">View History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log">
          <div className="p-4 rounded-lg border">
            <ExerciseLogForm />
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <ExerciseHistory />
        </TabsContent>
      </Tabs>
      </div>
    </ExerciseProvider>
  );
}
