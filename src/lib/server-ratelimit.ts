import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Initialize Upstash Redis from environment variables
const redis = Redis.fromEnv();

// Create tier-based limiters
// 1. Expensive operations (AI generation, bulk writes): 5 requests per 60s
export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "vsono:ratelimit:ai",
});

// 2. Standard authenticated mutations (Exam submissions, form posts): 15 requests per 60s
export const mutationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "60 s"),
  prefix: "vsono:ratelimit:mutation",
});

/**
 * Helper function to check rate limits in API routes using user ID or fallback identifier.
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; response?: NextResponse }> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: "Rate limit exceeded. Please slow down and try again shortly.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      ),
    };
  }

  return { success: true };
}
