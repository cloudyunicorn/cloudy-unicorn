import { FitnessContext, ChutesAPIResponse, APIError } from '@/lib/ai/types';

const API_TIMEOUT = 60000; // 30 seconds
const MAX_RETRIES = 2;

export async function getFitnessResponse(
  userMessage: string,
  context: FitnessContext,
  retries = MAX_RETRIES
): Promise<string> {
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | null = null;
  let response: Response;

  try {
    timeoutId = setTimeout(() => {
      console.log('API request timeout reached');
      controller.abort();
    }, API_TIMEOUT);

    response = await fetch("https://llm.chutes.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CHUTES_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3-0324",
        messages: [
          {
            role: "system",
            content: `You are an expert fitness coach. User context: 
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
        stream: false,
        max_tokens: 5120,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData: APIError = await response.json().catch(() => ({}));
      throw new Error(
        `API request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`
      );
    }

    const data: ChutesAPIResponse = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response structure');
    }

    return data.choices[0].message.content;

  } catch (error) {
    if (retries > 0 && 
        (error instanceof TypeError || // Network errors
         (error instanceof Error && error.name === 'AbortError') || // Timeout
         (error instanceof Error && error.message.includes('500')))) { // Server errors
      return getFitnessResponse(userMessage, context, retries - 1);
    }
    throw new Error(`Failed to get fitness response: ${
      error instanceof Error ? error.message : 'Unknown error'
    }`);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
