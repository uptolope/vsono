// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Client-side analytics stubs
// Replace with your real analytics provider (Plausible, PostHog, etc.)
// These are no-ops until you wire them up — they exist so the rest of
// the code compiles and calls are in the right places already.
// ═══════════════════════════════════════════════════════════════════

export function trackCheckoutStarted(product: string, price: number): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[analytics] checkout_started", { product, price });
    // Example: posthog.capture("checkout_started", { product, price });
  } catch {
    // Analytics should never break the app.
  }
}

export function trackSignup(source: string): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[analytics] signup", { source });
    // Example: posthog.capture("signup", { source });
  } catch {
    // Analytics should never break the app.
  }
}

export function trackDemoEngagement(action: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[analytics] demo_engagement", { action, ...data });
  } catch {
    // Analytics should never break the app.
  }
}
