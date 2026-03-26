import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Upstash env vars exist; otherwise allow requests (to prevent crashing dev environments without it)
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || ''
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || ''

let ratelimit: Ratelimit | null = null;

if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(20, '10 s'), // 20 requests per 10 seconds per IP globally
    analytics: true,
  });
}

export async function middleware(request: NextRequest) {
  // We only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Bypass if upstash is not configured
  if (!ratelimit) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse(
      JSON.stringify({ error: 'Too Many Requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
  ],
}
