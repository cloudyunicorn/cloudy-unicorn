import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const API_TIMEOUT = 120000;

// Allow up to 60 seconds for streaming AI responses on Vercel
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    // Auth is optional — the free body assessment page uses this without login
    // For production, consider adding rate limiting for unauthenticated requests
    const supabase = await createClient();
    try {
        await supabase.auth.getUser();
    } catch (error) {
        // Unauthenticated requests are allowed, so we just log or ignore the error
        console.warn("Authentication check failed, proceeding with unauthenticated request.", error);
    }

    const { message, context } = await req.json();

    if (!message || !context) {
        return new Response(JSON.stringify({ error: 'Missing message or context' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert fitness coach. Be concise and direct. User context: 
            Goals: ${context.goals?.join(', ') || 'general fitness'}
            Dietary Preferences: ${context.diet || 'none'}
            Fitness Level: ${context.fitnessLevel || 'beginner'}
            Health Conditions: ${context.healthConditions?.join(', ') || 'none'}`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                stream: true,
                max_tokens: 4096,
                temperature: 0.7
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return new Response(
                JSON.stringify({ error: errorData.message || `API error: ${response.status}` }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Stream the response back to the client
        const stream = new ReadableStream({
            async start(streamController) {
                const reader = response.body?.getReader();
                if (!reader) {
                    streamController.close();
                    return;
                }

                const decoder = new TextDecoder();
                let buffer = '';

                try {
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
                                    const text = data.choices?.[0]?.delta?.content || '';
                                    if (text) {
                                        streamController.enqueue(new TextEncoder().encode(text));
                                    }
                                } catch {
                                    // Skip malformed JSON chunks
                                }
                            }
                        }
                    }

                    // Process any remaining data in the buffer
                    if (buffer.trim()) {
                        const line = buffer.trim();
                        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                const text = data.choices?.[0]?.delta?.content || '';
                                if (text) {
                                    streamController.enqueue(new TextEncoder().encode(text));
                                }
                            } catch {
                                // Skip malformed JSON
                            }
                        }
                    }
                } finally {
                    reader.releaseLock();
                    streamController.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return new Response(JSON.stringify({ error: 'Request timed out' }), {
                status: 504,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    } finally {
        clearTimeout(timeoutId);
    }
}
