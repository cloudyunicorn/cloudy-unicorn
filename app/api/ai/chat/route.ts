import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from "@/lib/prisma";
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Allow up to 60 seconds for streaming AI responses on Vercel
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    // Auth is optional — the free body assessment page uses this without login
    // For production, consider adding rate limiting for unauthenticated requests
    const supabase = await createClient();
    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (error) {
        // Unauthenticated requests are allowed, so we just log or ignore the error
        console.warn("Authentication check failed, proceeding with unauthenticated request.", error);
    }

    // --- AI GENERATION RATE LIMITING LOGIC ---
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "unknown";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If user is authenticated, check their specific limit. Otherwise fallback to IP limit.
    let userIdForLimit = null;
    if (user) {
        const dbUser = await prisma.user.findUnique({
            where: { authId: user.id },
            select: { id: true }
        });
        if (dbUser) userIdForLimit = dbUser.id;
    }

    try {
        // @ts-ignore
        const generationCount = await prisma.aIGenerationLog.count({
            where: {
                createdAt: { gte: today },
                ...(userIdForLimit ? { userId: userIdForLimit } : { ipAddress: ip }),
            },
        });

        if (generationCount >= 5) {
            return new Response(JSON.stringify({ error: 'You have reached your daily limit of 5 AI generations. Please try again tomorrow.' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Log the generation right before proceeding with generation
        // @ts-ignore
        await prisma.aIGenerationLog.create({
            data: {
                userId: userIdForLimit,
                ipAddress: ip,
            }
        });
    } catch (dbError) {
        console.error("Error accessing database for rate limit check:", dbError);
        return new Response(JSON.stringify({ error: 'Internal server error while checking AI rate limit.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    // ----------------------------------------

    let body;
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }

    const aiChatSchema = z.object({
        message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
        context: z.object({
            goals: z.array(z.string()).optional(),
            diet: z.string().optional(),
            fitnessLevel: z.string().optional(),
            healthConditions: z.array(z.string()).optional()
        }).default({})
    });

    const parsed = aiChatSchema.safeParse(body);
    if (!parsed.success) {
        return new Response(JSON.stringify({ error: 'Invalid request data', details: parsed.error.issues }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { message, context } = parsed.data;

    try {
        const stream = await openai.chat.completions.create({
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
            max_completion_tokens: 4096,
            temperature: 0.7,
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content || '';
                        if (text) {
                            controller.enqueue(new TextEncoder().encode(text));
                        }
                    }
                } catch (err) {
                    console.error("Stream error:", err);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error("OpenAI API error:", error);

        if (error instanceof OpenAI.APIError) {
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: error.status || 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
