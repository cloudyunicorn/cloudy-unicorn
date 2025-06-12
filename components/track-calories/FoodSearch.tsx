import React, { useState } from 'react';
import { getFitnessResponse } from '@/lib/ai/chutes-client';
import { getFoodSearchPrompt } from '@/lib/ai/fitness-prompts';
import { useCalorie } from '@/contexts/CalorieContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FitnessContext } from '@/lib/ai/types';

const FoodSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [quantity, setQuantity] = useState<number>(100); // Default to 100g
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [showRaw, setShowRaw] = useState<boolean>(false);
  const { addCalorie } = useCalorie();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setNutritionData(null);
    
    try {
      // Get user context (simplified for now - should come from actual user data)
      const userContext: FitnessContext = {
        goals: ['weight maintenance'],
        diet: 'balanced',
        healthConditions: [],
        fitnessLevel: 'intermediate',
        bodyMetrics: {
          weight: 70,
          height: 175,
          age: 30,
          gender: 'male',
          bodyFatPercentage: 20,
          targetWeight: 75
        }
      };
      
      const prompt = getFoodSearchPrompt(userContext, `${quantity}g of ${query}`);
      const generator = getFitnessResponse(prompt, userContext);
      
      let fullResponse = '';
      for await (const chunk of generator) {
        fullResponse += chunk;
        // Update raw response for debugging
        setRawResponse(fullResponse);
      }
      
      // Parse the AI response
      const parsedData = parseNutritionResponse(fullResponse);
      setNutritionData(parsedData);
    } catch (err) {
      setError('Failed to fetch nutrition data. Please try again.');
      console.error('Food search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseNutritionResponse = (response: string) => {
    // Parser for the new structured response format
    const result: any = {
      name: 'N/A',
      serving: 'N/A',
      nutrition: {
        calories: 'N/A',
        protein: 'N/A',
        carbs: 'N/A',
        fats: 'N/A',
        fiber: 'N/A',
        sugar: 'N/A'
      },
      benefits: '',
      comparison: ''
    };

    // Extract values using the structured format
    const patterns = [
      { key: 'name', pattern: /Name:\s*(.+)/i },
      { key: 'serving', pattern: /Serving:\s*(.+)/i },
      { key: 'calories', pattern: /Calories:\s*([\d.]+)/i },
      { key: 'protein', pattern: /Protein:\s*([\d.]+)\s*g/i },
      { key: 'carbs', pattern: /Carbohydrates:\s*([\d.]+)\s*g/i },
      { key: 'fats', pattern: /Fats:\s*([\d.]+)\s*g/i },
      { key: 'fiber', pattern: /Fiber:\s*([\d.]+)\s*g/i },
      { key: 'sugar', pattern: /Sugar:\s*([\d.]+)\s*g/i },
      { key: 'benefits', pattern: /Benefits:\s*(.+)/i },
      { key: 'comparison', pattern: /Comparison:\s*(.+)/i }
    ];

    // Process each line
    const lines = response.split('\n');
    for (const line of lines) {
      for (const { key, pattern } of patterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          if (key in result.nutrition) {
            result.nutrition[key] = match[1];
          } else {
            result[key] = match[1];
          }
        }
      }
    }
    
    return result;
  };

  const handleAddToLog = async () => {
    if (nutritionData) {
      // Create a FormData object as expected by addCalorie
      const formData = new FormData();
      formData.append('food', nutritionData.name);
      formData.append('calories', nutritionData.nutrition.calories || '0');
      formData.append('protein', nutritionData.nutrition.protein || '0');
      formData.append('carbs', nutritionData.nutrition.carbs || '0');
      formData.append('fats', nutritionData.nutrition.fats || '0');
      formData.append('mealType', 'SNACK'); // Default to snack
      
      try {
        await addCalorie(formData);
      } catch (err) {
        setError('Failed to add to calorie log');
        console.error('Add calorie error:', err);
      }
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Food Nutrition Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="food-search">Search for food</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="food-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Apple, Chicken Breast"
                disabled={loading}
              />
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Quantity (g)"
                className="w-24"
                min="1"
                disabled={loading}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          {nutritionData && (
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">
                {nutritionData.name} ({quantity}g)
              </h3>
              
              <Table className="mb-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nutrient</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Calories</TableCell>
                    <TableCell>{nutritionData.nutrition.calories || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Protein (g)</TableCell>
                    <TableCell>{nutritionData.nutrition.protein || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Carbs (g)</TableCell>
                    <TableCell>{nutritionData.nutrition.carbs || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fats (g)</TableCell>
                    <TableCell>{nutritionData.nutrition.fats || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fiber (g)</TableCell>
                    <TableCell>{nutritionData.nutrition.fiber || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sugar (g)</TableCell>
                    <TableCell>{nutritionData.nutrition.sugar || 'N/A'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="mb-4">
                <h4 className="font-medium mb-1">Health Benefits</h4>
                <p className="text-sm">{nutritionData.benefits || 'No benefits information available.'}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-1">Comparison</h4>
                <p className="text-sm">{nutritionData.comparison || 'No comparison information available.'}</p>
              </div>
              
              <Button onClick={handleAddToLog} variant="outline">
                Add to Calorie Log
              </Button>
            </div>
          )}

          {rawResponse && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowRaw(!showRaw)}
              >
                {showRaw ? 'Hide Raw Response' : 'Show Raw Response'}
              </Button>
              {showRaw && (
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {rawResponse}
                </pre>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodSearch;
