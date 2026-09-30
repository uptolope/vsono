import "server-only";

import { createHash } from "node:crypto";

/**
 * Server-side GA4 conversion reporting (Measurement Protocol).
 *
 * Purchases are reported from the verified Stripe webhook, never from the
 * browser, so they can't be spoofed, dropped by ad-blockers or double counted
 * (GA4 de-duplicates on transaction_id).
 *
 * Needs NEXT_PUBLIC_GA_MEASUREMENT_ID and GA_API_SECRET (GA4 Admin ▸ Data
 * streams ▸ Measurement Protocol API secrets). Silently does nothing when
 * either is missing. Failures are logged and swallowed: analytics must never
 * make a payment webhook fail.
 *
 * PRIVACY: only the order id, amount and product are sent. No email, name or
 * other PII. When the browser's GA client id wasn't captured (ad-blocker,
 * GPC/DNT visitors — the tag never loaded for them), NO event is sent at all
 * rather than creating an identifier for someone who opted out.
 */
export async function reportPurchaseToGa4(args: {
  transactionId: string;
  gaClientId?: string;
  amountInCents: number;
  currency: string;
  productType: string;
  productName: string;
}): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const apiSecret = process.env.GA_API_SECRET?.trim();

  if (!measurementId || !apiSecret || !args.gaClientId) {
    return;
  }

  try {
    const url =
      "https://www.google-analytics.com/mp/collect" +
      `?measurement_id=${encodeURIComponent(measurementId)}` +
      `&api_secret=${encodeURIComponent(apiSecret)}`;

    const res = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        client_id: args.gaClientId,
        events: [
          {
            name: "purchase",
            params: {
              transaction_id: args.transactionId,
              value: args.amountInCents / 100,
              currency: args.currency.toUpperCase(),
              items: [
                {
                  item_id: args.productType,
                  item_name: args.productName,
                  item_category: "Education",
                  price: args.amountInCents / 100,
                  quantity: 1,
                },
              ],
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      console.warn(`[ga4] Measurement Protocol responded ${res.status}`);
    }
  } catch (error) {
    console.warn("[ga4] purchase report failed:", error);
  }
}

/** Short, non-reversible tag for log lines. */
export function hashForLog(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 10);
}
