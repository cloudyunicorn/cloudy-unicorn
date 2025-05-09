import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';

export type MealPlan = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  days: any;
  caloriesPerDay: number;
  dietaryTags: string[];
  isActive: boolean;
};

type MealPlansListProps = {
  onSave?: (plan: MealPlan) => Promise<void> | void;
};

export const MealPlansList = ({ onSave }: MealPlansListProps) => {
  const { data, isLoading, error, refetch } = useData();
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);

  return (
    <div className="mx-6 w-full">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Your Saved Meal Plans</CardTitle>
        </CardHeader>
        <CardContent>
      {isLoading && (!data?.mealPlans || data.mealPlans.length === 0) ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error.message || 'Failed to load meal plans'}</p>
        ) : data?.mealPlans && data.mealPlans.length > 0 ? (
          <div className="space-y-3">
            {data.mealPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{plan.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p 
                    className="mt-2 text-sm line-clamp-2 cursor-pointer hover:text-primary"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {plan.description?.includes('**') 
                      ? plan.description?.split('**')[1].split('\n')[0].trim()
                      : plan.description?.substring(0, 100) + '...'}
                  </p>
                </div>
              ))}
            </div>
        ) : (
          <p className="text-sm text-gray-500">No saved meal plans found</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 text-primary" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                table: ({node, ...props}) => <table className="w-full border-collapse mb-4" {...props} />,
                th: ({node, ...props}) => <th className="border p-2 text-left bg-gray-50" {...props} />,
                td: ({node, ...props}) => <td className="border p-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                hr: ({node, ...props}) => <hr className="my-4 border-gray-200" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
              }}
            >
              {selectedPlan?.description || ''}
            </ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
