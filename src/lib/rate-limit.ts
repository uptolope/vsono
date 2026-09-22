// ═══════════════════════════════════════════════════════════════════
// Rate limiting — Upstash Redis when configured, Postgres (via Prisma)
// otherwise. Both are real shared counters, correct across every
// Vercel serverless instance.
//
// The old version of this file fell back to an in-memory Map when
// Upstash wasn't configured. That's broken on Vercel (and any
// serverless host): every request can land on a different function
// instance with its own empty counter, so an attacker gets
// effectively unlimited login attempts by spreading requests across
// instances. There is no in-memory fallback anymore — it's been
// deleted, not layered under the fix, so there's exactly one code
// path and it's always safe.
//
// Upstash is used when UPSTASH_REDIS_REST_URL/TOKEN are set (faster,
// keeps this traffic off your primary DB). Without those, every call
// goes through a single-statement atomic upsert against the
// RateLimitBucket table in your existing Postgres database — no new
// service required, and correct on day one with zero setup.
// ═══════════════════════════════════════════════════════════════════

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

// ── Postgres-backed fallback ────────────────────────────────────────
// Fixed-window counter, one row per key, updated with a single atomic
// upsert so concurrent requests from different instances can't race
// each other into double-counting or double-resetting a window.
async function postgresRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);

  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>(
    Prisma.sql`
      INSERT INTO "rate_limit_buckets" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${windowEnd})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "rate_limit_buckets"."resetAt" < ${now} THEN 1
          ELSE "rate_limit_buckets"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "rate_limit_buckets"."resetAt" < ${now} THEN ${windowEnd}
          ELSE "rate_limit_buckets"."resetAt"
        END
      RETURNING "count", "resetAt"
    `
  );

  const { count, resetAt } = rows[0];

  // Opportunistic cleanup of long-expired rows so this table doesn't
  // grow forever. Runs on ~1% of calls instead of every call or a
  // separate cron job — cheap, and no operational setup required.
  if (Math.random() < 0.01) {
    const staleCutoff = new Date(now.getTime() - 60 * 60 * 1000);
    prisma.$executeRaw(
      Prisma.sql`
        DELETE FROM "rate_limit_buckets"
        WHERE "resetAt" < ${staleCutoff}
      `
    ).catch((err: unknown) =>
      console.error("[rate-limit] Cleanup failed:", err)
    );
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: resetAt.getTime(),
  };
}

/**
 * Rate limit a request by an arbitrary key (combine IP + route, and
 * optionally + email, to scope the bucket correctly).
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are set.
 * Otherwise uses a Postgres-backed atomic counter. Both are real
 * shared counters — correct across every serverless instance, with
 * no unsafe fallback path.
 */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  if (!hasUpstash) {
    return postgresRateLimit(key, opts);
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
