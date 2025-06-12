'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalorieLogForm } from './CalorieLogForm';
import { CalorieHistory } from './CalorieHistory';
import { CalorieProvider } from '@/contexts/CalorieContext';
import FoodSearch from './FoodSearch';

export function TrackCalories() {
  return (
    <CalorieProvider>
      <div className="space-y-4 p-4">
        <Tabs defaultValue="log" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log">Log Calories</TabsTrigger>
            <TabsTrigger value="history">View History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="log">
            <FoodSearch />
            <div className="p-4 rounded-lg border mt-4">
              <CalorieLogForm />
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <CalorieHistory />
          </TabsContent>
        </Tabs>
      </div>
    </CalorieProvider>
  );
}
