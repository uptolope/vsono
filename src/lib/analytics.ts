// ────────────────────────────────────────────────────────────────────────────────
// SonoPrep – client-side analytics (Google Analytics 4)
//
// The GA tag itself is loaded by <Analytics /> (src/components/Analytics.tsx)
// only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set and the visitor has not sent a
// Do-Not-Track / Global-Privacy-Control signal. Every helper here is a safe
// no-op when the tag is not present, so calling them never throws.
//
// Conversion events:
//   generate_lead   free-diagnostic email capture (home / demo / get-started)
//   sign_up         real account creation
//   begin_checkout  click on a buy button
//   purchase        sent SERVER-SIDE from the verified Stripe webhook
//                   (src/lib/analytics-server.ts) so it cannot be spoofed,
//                   blocked by an ad-blocker or double counted.
// ────────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, unknown>;

function send(event: string, params?: EventParams): void {
  if (typeof window === "undefined") return;

  try {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[analytics]", event, params ?? {});
    }

    window.gtag?.("event", event, params ?? {});
  } catch {
    /* analytics must never break the UI */
  }
}

/** GA4 client id from the `_ga` cookie ("GA1.1.123.456" -> "123.456"). */
export function getGaClientId(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d+\.\d+)/);

  return match?.[1];
}

export function trackLead(source: string, data?: EventParams): void {
  send("generate_lead", { lead_source: source, ...data });
}

export function trackSignup(source: string): void {
  send("sign_up", { method: source });
}

export function trackLogin(): void {
  send("login", { method: "email" });
}

export function trackCheckoutStarted(product: string, price: number): void {
  send("begin_checkout", {
    value: price,
    currency: "USD",
    items: [
      {
        item_id: product,
        item_name: product,
        item_category: "Education",
        price,
        quantity: 1,
      },
    ],
  });
}

export function trackDemoEngagement(action: string, data?: EventParams): void {
  send(`demo_${action}`, data);
}

/**
 * Client-side purchase event. NOT called by the app: purchases are reported
 * from the Stripe webhook. Kept for completeness/manual use only.
 */
export function trackPurchase(
  transactionId: string,
  price: number,
  product: string,
): void {
  send("purchase", {
    transaction_id: transactionId,
    value: price,
    currency: "USD",
    items: [
      { item_id: product, item_name: product, item_category: "Education", price, quantity: 1 },
    ],
  });
}

export function trackPageView(pageName: string): void {
  send("page_view", {
    page_title: pageName,
    page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
  });
}

/** Outbound/tool engagement used to see which linkable assets get real use. */
export function trackToolUse(tool: string, data?: EventParams): void {
  send("tool_use", { tool_name: tool, ...data });
}

export function trackCtaClick(location: string, target: string): void {
  send("cta_click", { cta_location: location, cta_target: target });
}
