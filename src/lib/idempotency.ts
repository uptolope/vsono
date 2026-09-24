import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * Ensures an action can only be performed once within a short time window (e.g., 5 seconds)
 * to prevent double submissions or duplicate Stripe checkout creations.
 */
export async function checkIdempotency(key: string, ttlSeconds = 5): Promise<boolean> {
  // SET key value NX EX seconds -> returns "OK" if key was set (first time), null if it already existed
  const result = await redis.set(key, "locked", {
    nx: true,
    ex: ttlSeconds,
  });

  return result === "OK";
}
