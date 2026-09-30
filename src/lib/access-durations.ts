/**
 * Single source of truth for how long a purchase grants access.
 *
 * Deliberately has no env / DB / "server-only" dependencies so it can be
 * imported from the webhook, src/lib/stripe.ts, and scripts/seed-products.ts.
 *
 * The Stripe webhook uses THIS table (not Product.accessDurationDays) so the
 * guarantee can't be broken by a Product row that was never seeded, or that
 * still has the schema default of 30 days.
 */
export const ACCESS_DAYS = {
  FLASHCARDS: 30,
  EXAM_SIMULATOR: 30,
  PHYSICS_PEARLS: 30,
  STUDY_NOTES: 30,
  PREMIUM_BUNDLE: 45,
} as const;

export type AccessProductType = keyof typeof ACCESS_DAYS;

export function getAccessDays(productType: string): number {
  const days = (ACCESS_DAYS as Record<string, number>)[productType];

  if (!days) {
    throw new Error(`No access duration configured for product ${productType}`);
  }

  return days;
}
