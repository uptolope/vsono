import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

// API version pinned to 2026-07-29.dahlia — the current version per
// Stripe's own versioning page (docs.stripe.com/api/versioning),
// checked at the time of this edit (Aug 2026). This requires the
// `stripe` npm package to be v22+ (bumped in package.json alongside
// this change) — older SDK versions only type-support
// "2025-02-24.acacia" and won't compile against a newer literal.
//
// IMPORTANT: test this against Stripe in test mode before deploying
// live. Jumping from acacia (Feb 2025) to dahlia (2026) crosses at
// least one breaking-change release (basil, March 2025) — the
// specific calls this file makes (checkout.sessions.create,
// webhooks.constructEvent, charges.retrieve) are stable, low-surface
// APIs unlikely to be affected, but "unlikely" isn't "verified." Run
// a real test-mode checkout + webhook before flipping to live keys.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-07-29.dahlia",
});

// Server-side only. The client sends a product KEY (e.g. "FLASHCARDS"),
// never a price or a Stripe price ID — this map is the single place
// that decides what that key actually costs. If this map is wrong,
// the price is wrong; there is no other input that can override it.
//
// Fill these in with your real Stripe Price IDs (dashboard → Products).
export const PRODUCT_PRICE_MAP: Record<string, { priceId: string; accessDays: number }> = {
  FLASHCARDS: { priceId: process.env.STRIPE_PRICE_FLASHCARDS ?? "", accessDays: 30 },
  EXAM_SIMULATOR: { priceId: process.env.STRIPE_PRICE_EXAM ?? "", accessDays: 30 },
  PHYSICS_PEARLS: { priceId: process.env.STRIPE_PRICE_PEARLS ?? "", accessDays: 30 },
  STUDY_NOTES: { priceId: process.env.STRIPE_PRICE_NOTES ?? "", accessDays: 30 },
  PREMIUM_BUNDLE: { priceId: process.env.STRIPE_PRICE_BUNDLE ?? "", accessDays: 45 },
};
