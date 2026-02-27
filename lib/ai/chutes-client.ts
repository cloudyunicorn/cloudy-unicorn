import { FitnessContext } from '@/lib/ai/types';

const MAX_RETRIES = 2;

export async function* getFitnessResponse(
  userMessage: string,
  context: FitnessContext,
  retries = MAX_RETRIES
): AsyncGenerator<string, void, unknown> {
  let response: Response;

  try {
    response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage,
        context: {
          goals: context.goals,
          diet: context.diet,
          fitnessLevel: context.fitnessLevel,
          healthConditions: context.healthConditions,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API request failed with status ${response.status}: ${errorData.error || 'Unknown error'}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to get response reader');

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      if (text) {
        yield text;
      }
    }

  } catch (error) {
    if (retries > 0 &&
      (error instanceof TypeError || // Network errors
        (error instanceof Error && error.message.includes('500')))) { // Server errors
      yield* getFitnessResponse(userMessage, context, retries - 1);
      return;
    }
    throw new Error(`Failed to get fitness response: ${error instanceof Error ? error.message : 'Unknown error'
      }`);
  }
}
