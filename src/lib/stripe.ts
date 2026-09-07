// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Stripe Configuration (SERVER-SIDE ONLY)
// Stripe API client, price IDs, and webhook secret validation
// ═══════════════════════════════════════════════════════════════════

import Stripe from "stripe";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// ── ENVIRONMENT VARIABLE VALIDATION ────────────────────────────────
// Validate all required Stripe environment variables before the app
// actually starts serving traffic.
//
// NOT during `next build` itself: Next.js sets NODE_ENV=production for
// the build, and evaluates every route module (including this one) to
// collect page data — with no real request happening and no guarantee
// your build environment (a fresh clone, a teammate's machine, a
// Vercel Preview build without secrets configured yet) has these vars
// set. Throwing unconditionally here crashed the entire build the same
// way an equivalent bug in src/lib/resend.ts did. NEXT_PHASE lets us
// tell "building" apart from "actually serving a request" and only
// fail fast in the latter, which is where a real misconfiguration
// should be caught anyway.
function validateStripeEnvVars(): void {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return;

  const required = [
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_FLASHCARDS",
    "STRIPE_PRICE_EXAM_SIMULATOR",
    "STRIPE_PRICE_PHYSICS_PEARLS",
    "STRIPE_PRICE_STUDY_NOTES",
    "STRIPE_PRICE_PREMIUM_BUNDLE",
    "STRIPE_WEBHOOK_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    throw new Error(
      `Missing required Stripe environment variables: ${missing.join(", ")}`
    );
  }
}

// Run validation at module load
validateStripeEnvVars();

// ── STRIPE CLIENT ──────────────────────────────────────────────────
// Initialize Stripe with secret key and pinned API version
let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    stripe = new Stripe(secretKey, {
      apiVersion: '2026-07-29.dahlia',
    });
  }

  return stripe;
}

// ── PRODUCT PRICE MAP ──────────────────────────────────────────────
// Maps product keys to their Stripe price IDs and access duration
// All price IDs come from environment variables (validated above)
export const PRODUCT_PRICE_MAP = {
  FLASHCARDS: {
    priceId: process.env.STRIPE_PRICE_FLASHCARDS || "",
    accessDays: 30,
  },
  EXAM_SIMULATOR: {
    priceId: process.env.STRIPE_PRICE_EXAM_SIMULATOR || "",
    accessDays: 30,
  },
  PHYSICS_PEARLS: {
    priceId: process.env.STRIPE_PRICE_PHYSICS_PEARLS || "",
    accessDays: 30,
  },
  STUDY_NOTES: {
    priceId: process.env.STRIPE_PRICE_STUDY_NOTES || "",
    accessDays: 30,
  },
  PREMIUM_BUNDLE: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_BUNDLE || "",
    accessDays: 45,
  },
} as const;

// Type-safe product key
export type ProductKey = keyof typeof PRODUCT_PRICE_MAP;

// ── WEBHOOK SECRET ────────────────────────────────────────────────
// Stripe webhook secret for signature verification
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// ── HELPER FUNCTION ───────────────────────────────────────────────
// Get price entry for a product
export function getPriceEntry(productKey: ProductKey) {
  return PRODUCT_PRICE_MAP[productKey];
}
