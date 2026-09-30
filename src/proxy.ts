import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ratelimit } from "@/lib/ratelimit";

// Machine-to-machine endpoints are never IP rate limited here: Stripe and mail
// providers send bursts from shared addresses, and these routes authenticate
// themselves (signature / CRON_SECRET / signed token).
const EXEMPT_PREFIXES = ["/api/webhooks/", "/api/cron/", "/api/unsubscribe"];

// The Upstash limiter only works when its env vars exist. Without them every
// /api/* request used to throw (HTTP 500) — including the Stripe webhook —
// even though Upstash is documented as optional. Route handlers still apply
// their own Postgres-backed limits (src/lib/rate-limit.ts).
const upstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (
    upstashConfigured &&
    pathname.startsWith("/api/") &&
    !EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    let result: Awaited<ReturnType<typeof ratelimit.limit>>;

    try {
      result = await ratelimit.limit(`proxy_${ip}`);
    } catch (error) {
      // Fail open: a limiter outage must not take down checkout or webhooks.
      console.error("[proxy] rate limiter unavailable:", error);
      return NextResponse.next();
    }

    const { success, limit, reset, remaining } = result;

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded. Too many requests." }),
        { 
          status: 429, 
          headers: { 
            "content-type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          } 
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
