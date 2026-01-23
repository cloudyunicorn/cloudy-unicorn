// AI Client for fitness responses using OpenRouter API
// React Native streaming using XMLHttpRequest for real-time updates
import { FitnessContext } from '@/types/database';

const API_TIMEOUT = 300000; // 5 minutes for reasoning models that think longer
const MAX_RETRIES = 2;

const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || process.env.EXPO_PUBLIC_CHUTES_API_TOKEN || '';

// Streaming function with separate phases for thinking vs content
export function streamFitnessResponse(
    userMessage: string,
    context: FitnessContext,
    onChunk: (text: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    onThinking?: (isThinking: boolean) => void,
    retries = MAX_RETRIES
): () => void {
    const xhr = new XMLHttpRequest();
    let lastIndex = 0;
    let buffer = '';
    let hasReceivedContent = false;
    let isInThinkingPhase = true;

    xhr.open('POST', 'https://openrouter.ai/api/v1/chat/completions', true);
    xhr.setRequestHeader('Authorization', `Bearer ${API_KEY}`);
    xhr.setRequestHeader('HTTP-Referer', 'https://cloudyunicorn.com');
    xhr.setRequestHeader('X-Title', 'Cloudy Unicorn Mobile');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.timeout = API_TIMEOUT;

    xhr.onprogress = () => {
        const newData = xhr.responseText.substring(lastIndex);
        lastIndex = xhr.responseText.length;
        buffer += newData;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                try {
                    const data = JSON.parse(line.substring(6));
                    const delta = data.choices?.[0]?.delta;
                    const content = delta?.content || '';
                    const reasoning = delta?.reasoning || '';

                    // If we get content, switch to content phase
                    if (content) {
                        if (isInThinkingPhase) {
                            isInThinkingPhase = false;
                            onThinking?.(false);
                        }
                        hasReceivedContent = true;
                        onChunk(content);
                    } else if (reasoning && !hasReceivedContent) {
                        // Only show thinking indicator on first reasoning chunk
                        if (isInThinkingPhase) {
                            onThinking?.(true);
                        }
                    }
                } catch (e) {
                    // Skip unparseable lines
                }
            }
        }
    };

    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            // Process any remaining data in buffer
            if (buffer.startsWith('data: ') && !buffer.includes('[DONE]')) {
                try {
                    const data = JSON.parse(buffer.substring(6));
                    const delta = data.choices?.[0]?.delta;
                    const content = delta?.content || '';
                    if (content) {
                        if (isInThinkingPhase) {
                            isInThinkingPhase = false;
                            onThinking?.(false);
                        }
                        onChunk(content);
                    }
                } catch (e) {
                    // Skip
                }
            }
            onThinking?.(false);
            onComplete();
        } else {
            onError(new Error(`API request failed with status ${xhr.status}`));
        }
    };

    xhr.onerror = () => {
        if (retries > 0) {
            streamFitnessResponse(userMessage, context, onChunk, onComplete, onError, onThinking, retries - 1);
        } else {
            onError(new Error('Network error'));
        }
    };

    xhr.ontimeout = () => {
        if (retries > 0) {
            streamFitnessResponse(userMessage, context, onChunk, onComplete, onError, onThinking, retries - 1);
        } else {
            onError(new Error('Request timeout'));
        }
    };

    // Notify that we're starting in thinking phase
    onThinking?.(true);

    xhr.send(JSON.stringify({
        model: "xiaomi/mimo-v2-flash:free",
        messages: [
            {
                role: "system",
                content: `You are an expert fitness coach. Be concise and direct. User context: 
            Goals: ${context.goals.join(', ')}
            Dietary Preferences: ${context.diet || 'none'}
            Fitness Level: ${context.fitnessLevel}
            Health Conditions: ${context.healthConditions.join(', ') || 'none'}`
            },
            {
                role: "user",
                content: userMessage
            }
        ],
        stream: true,
        max_tokens: 4096,
        temperature: 0.7
    }));

    // Return cancel function
    return () => xhr.abort();
}

// Async generator wrapper for backward compatibility
export async function* getFitnessResponse(
    userMessage: string,
    context: FitnessContext,
    retries = MAX_RETRIES
): AsyncGenerator<string, void, unknown> {
    const chunks: string[] = [];
    let resolveNext: ((value: IteratorResult<string, void>) => void) | null = null;
    let done = false;
    let error: Error | null = null;

    const onChunk = (text: string) => {
        if (resolveNext) {
            resolveNext({ value: text, done: false });
            resolveNext = null;
        } else {
            chunks.push(text);
        }
    };

    const onComplete = () => {
        done = true;
        if (resolveNext) {
            resolveNext({ value: undefined as any, done: true });
            resolveNext = null;
        }
    };

    const onError = (err: Error) => {
        error = err;
        done = true;
        if (resolveNext) {
            resolveNext({ value: undefined as any, done: true });
            resolveNext = null;
        }
    };

    streamFitnessResponse(userMessage, context, onChunk, onComplete, onError, undefined, retries);

    while (!done || chunks.length > 0) {
        if (chunks.length > 0) {
            yield chunks.shift()!;
        } else if (!done) {
            const result = await new Promise<IteratorResult<string, void>>((resolve) => {
                resolveNext = resolve;
            });
            if (result.done) break;
            yield result.value;
        }
    }

    if (error) {
        throw error;
    }
}

// Prompt generators
export const getMealPrompt = (context: FitnessContext, query: string): string => {
    const { bodyMetrics } = context;
    let bodyInfo = '';

    if (bodyMetrics) {
        bodyInfo = `Body Metrics:
    - Age: ${bodyMetrics.age || 'not specified'}
    - Gender: ${bodyMetrics.gender || 'not specified'} 
    - Weight: ${bodyMetrics.weight ? `${bodyMetrics.weight} kg` : 'not specified'}
    - Height: ${bodyMetrics.height ? `${bodyMetrics.height} cm` : 'not specified'}
    - Body Fat: ${bodyMetrics.bodyFatPercentage ? `${bodyMetrics.bodyFatPercentage}%` : 'not specified'}
    - Target Weight: ${bodyMetrics.targetWeight ? `${bodyMetrics.targetWeight} kg` : 'not specified'}\n`;
    }

    return `As a nutritionist, suggest personalized meal options considering:
${bodyInfo}
Dietary preferences: ${context.diet}
Health conditions: ${context.healthConditions.join(', ') || 'none'}
Current goals: ${context.goals.join(', ')}

Calculate appropriate calorie and macronutrient ranges based on the provided body metrics and goals.

User query: ${query}

Respond with:
1. 3 meal suggestions with ingredients and detailed recipe
2. Detailed nutritional breakdown (calories, protein, carbs, fats, fiber)
3. Preparation time and difficulty
4. Notes on how these meals align with the user's body metrics and goals`;
};

export const getWorkoutPrompt = (context: FitnessContext, query: string): string => {
    const { bodyMetrics } = context;
    let bodyInfo = '';

    if (bodyMetrics) {
        bodyInfo = `Body Metrics:
    - Age: ${bodyMetrics.age || 'not specified'}
    - Gender: ${bodyMetrics.gender || 'not specified'} 
    - Weight: ${bodyMetrics.weight ? `${bodyMetrics.weight} kg` : 'not specified'}
    - Height: ${bodyMetrics.height ? `${bodyMetrics.height} cm` : 'not specified'}
    - Body Fat: ${bodyMetrics.bodyFatPercentage ? `${bodyMetrics.bodyFatPercentage}%` : 'not specified'}\n`;
    }

    return `As a personal trainer, create a personalized workout plan considering:
${bodyInfo}
Fitness level: ${context.fitnessLevel}
Available equipment: ${context.currentPlan?.workouts?.join(', ') || 'None specified'}
Health considerations: ${context.healthConditions.join(', ') || 'None'}

User query: ${query}

Respond with:
1. Warm-up routine tailored to user's fitness level
2. 3-5 exercises with:
   - Name and description
   - Sets/reps adjusted for body metrics
3. Cool-down suggestions
4. Notes on how this workout aligns with the user's physical characteristics`;
};

export const getHabitPrompt = (context: FitnessContext, query: string): string => {
    const { bodyMetrics } = context;
    let bodyInfo = '';

    if (bodyMetrics) {
        bodyInfo = `Body Metrics:
    - Age: ${bodyMetrics.age || 'not specified'}
    - Weight: ${bodyMetrics.weight ? `${bodyMetrics.weight} kg` : 'not specified'}
    - Target Weight: ${bodyMetrics.targetWeight ? `${bodyMetrics.targetWeight} kg` : 'not specified'}
    - Fitness Level: ${context.fitnessLevel}\n`;
    }

    return `As a wellness coach, suggest personalized healthy habits considering:
${bodyInfo}
Current Goals: ${context.goals.join(', ')}

User query: ${query}

Respond with:
1. 3 daily habit suggestions tailored to the user's metrics
2. Specific implementation tips based on their lifestyle
3. Progress tracking methods
4. Expected benefits and timeline for each habit`;
};

export const getHealthAssessmentPrompt = (context: FitnessContext, query: string): string => {
    const { bodyMetrics } = context;
    let bodyInfo = '';

    if (bodyMetrics) {
        bodyInfo = `Body Metrics:
    - Age: ${bodyMetrics.age || 'not specified'}
    - Gender: ${bodyMetrics.gender || 'not specified'}
    - Weight: ${bodyMetrics.weight ? `${bodyMetrics.weight} kg` : 'not specified'}
    - Height: ${bodyMetrics.height ? `${bodyMetrics.height} cm` : 'not specified'}
    - Body Fat: ${bodyMetrics.bodyFatPercentage ? `${bodyMetrics.bodyFatPercentage}%` : 'not specified'}
    - Target Weight: ${bodyMetrics.targetWeight ? `${bodyMetrics.targetWeight} kg` : 'not specified'}\n`;
    }

    return `As a certified fitness professional, provide a body assessment based on:
${bodyInfo}
Health Conditions: ${context.healthConditions.join(', ') || 'none'}
Fitness Goals: ${context.goals.join(', ') || 'not specified'}

User query: ${query}

Respond with:
1. Summary of current body status
2. Key areas for improvement
3. Actionable steps tailored to the user
4. Warning signs to watch for`;
};

export const getFoodSearchPrompt = (context: FitnessContext, query: string): string => {
    return `As a nutritionist, provide detailed nutritional information for: ${query}
  
User Context:
- Dietary preferences: ${context.diet}
- Health conditions: ${context.healthConditions.join(', ') || 'none'}
- Goals: ${context.goals.join(', ')}

Respond with the following in the exact format:

Name: [Food Name]
Serving: [Serving Size]
Calories: [number]
Protein: [number] g
Carbohydrates: [number] g
Fats: [number] g
Fiber: [number] g
Sugar: [number] g
Benefits: [text]
Comparison: [text]

Do not add any other text.`;
};
