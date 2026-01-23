import { FitnessContext, ChutesAPIResponse, APIError } from '@/lib/ai/types';

const API_TIMEOUT = 120000; // 120 seconds for reasoning models
const MAX_RETRIES = 2;

export async function* getFitnessResponse(
  userMessage: string,
  context: FitnessContext,
  retries = MAX_RETRIES
): AsyncGenerator<string, void, unknown> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let response: Response;

  try {
    timeoutId = setTimeout(() => {
      console.log('API request timeout reached');
      controller.abort();
    }, API_TIMEOUT);

    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CHUTES_API_TOKEN}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://cloudyunicorn.com",
        "X-Title": "Cloudy Unicorn",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
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
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData: APIError = await response.json().catch(() => ({}));
      throw new Error(
        `API request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to get response reader');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const data = JSON.parse(line.substring(6));
            const delta = data.choices?.[0]?.delta;
            // R1 model streams reasoning first, then content - use both
            const text = delta?.content || delta?.reasoning || '';
            if (text) {
              yield text;
            }
          } catch (e) {
            console.error('Error parsing stream data:', e);
          }
        }
      }
    }

  } catch (error) {
    if (retries > 0 &&
      (error instanceof TypeError || // Network errors
        (error instanceof Error && error.name === 'AbortError') || // Timeout
        (error instanceof Error && error.message.includes('500')))) { // Server errors
      yield* getFitnessResponse(userMessage, context, retries - 1);
      return;
    }
    throw new Error(`Failed to get fitness response: ${error instanceof Error ? error.message : 'Unknown error'
      }`);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
