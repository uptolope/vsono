// ═══════════════════════════════════════════════════════════════════
// Rate limiting — Upstash Redis when configured, in-memory fallback
// otherwise.
//
// WHY THIS CHANGED: the old version of this file was in-memory only.
// That's broken on Vercel (and any serverless host): every request
// can land on a different function instance with its own empty
// counter, so an attacker gets effectively unlimited attempts by
// spreading requests across instances. This version fixes that by
// using Upstash Redis (a real shared store) whenever it's configured,
// and only falls back to the old in-memory behavior for local dev
// when you haven't set up Upstash yet.
//
// SETUP (2 minutes, free tier is enough for this app):
//   1. Create a database at https://console.upstash.com (free tier)
//   2. Copy the REST URL and REST TOKEN it gives you
//   3. Add to your environment (Vercel project settings + .env.local):
//        UPSTASH_REDIS_REST_URL=...
//        UPSTASH_REDIS_REST_TOKEN=...
//   4. Redeploy. No other code changes needed — this file detects the
//      env vars automatically.
//
// Until you do that, every deploy prints a console.warn in production
// so this doesn't fail silently.
// ═══════════════════════════════════════════════════════════════════

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

const redis = hasUpstash
  ? new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! })
  : null;

// One Ratelimit instance per distinct (limit, windowMs) pair, reused
// across requests/invocations rather than rebuilt every call.
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  const existing = limiterCache.get(cacheKey);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    analytics: false,
    prefix: "sonoprep-ratelimit",
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
}

// ── In-memory fallback (local dev only — see file header) ──────────
interface Bucket {
  count: number;
  resetAt: number;
}
const memoryBuckets = new Map<string, Bucket>();

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt < now) memoryBuckets.delete(key);
  }
}, 60_000).unref?.();

function memoryRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

let warnedAboutMemoryFallback = false;

/**
 * Rate limit a request by an arbitrary key (combine IP + route, and
 * optionally + email, to scope the bucket correctly).
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are set (works
 * correctly across serverless instances). Falls back to an in-memory
 * counter otherwise — fine for local dev, NOT safe as your only
 * defense in production on Vercel.
 */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  if (!hasUpstash) {
    if (process.env.NODE_ENV === "production" && !warnedAboutMemoryFallback) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not " +
          "set. Falling back to in-memory rate limiting, which does NOT provide " +
          "real protection on serverless deployments (each instance has its own " +
          "counter). Set the Upstash env vars — see src/lib/rate-limit.ts header."
      );
      warnedAboutMemoryFallback = true;
    }
    return memoryRateLimit(key, opts);
  }

  const limiter = getLimiter(opts.limit, opts.windowMs);
  const result = await limiter.limit(key);
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

/** Best-effort client IP extraction from a standard Headers object (API routes). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/**
 * Same thing, but for NextAuth's `authorize(credentials, req)` second
 * argument, whose `.headers` is a plain object (Record<string, any>),
 * not a Headers instance — NextAuth doesn't give you a real Headers
 * object there, so this can't just reuse getClientIp() above.
 */
export function getClientIpFromRecord(headers: Record<string, unknown> | undefined): string {
  if (!headers) return "unknown";
  const forwarded = headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  const real = headers["x-real-ip"];
  if (typeof real === "string" && real.length > 0) return real;
  return "unknown";
}
