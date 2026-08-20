// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Stripe Configuration (SERVER-SIDE ONLY)
// Stripe API client, price IDs, and webhook secret validation
// ═══════════════════════════════════════════════════════════════════

import Stripe from "stripe";

// ── ENVIRONMENT VARIABLE VALIDATION ────────────────────────────────
// Validate all required Stripe environment variables at module load time
function validateStripeEnvVars(): void {
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
      `Missing required Stripe environment variables: \${missing.join(", ")}`
    );
  }
}

// Run validation at module load
validateStripeEnvVars();

// ── STRIPE CLIENT ──────────────────────────────────────────────────
// Initialize Stripe with secret key and pinned API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-07-29.dahlia",
});

// ── PRODUCT PRICE MAP ──────────────────────────────────────────────
// Maps product keys to their Stripe price IDs and access duration
// All price IDs come from environment variables (validated above)
export const PRODUCT_PRICE_MAP = {
  FLASHCARDS: {
    priceId: process.env.STRIPE_PRICE_FLASHCARDS || "",
    accessDays: 365,
  },
  EXAM_SIMULATOR: {
    priceId: process.env.STRIPE_PRICE_EXAM_SIMULATOR || "",
    accessDays: 365,
  },
  PHYSICS_PEARLS: {
    priceId: process.env.STRIPE_PRICE_PHYSICS_PEARLS || "",
    accessDays: 365,
  },
  STUDY_NOTES: {
    priceId: process.env.STRIPE_PRICE_STUDY_NOTES || "",
    accessDays: 365,
  },
  PREMIUM_BUNDLE: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_BUNDLE || "",
    accessDays: 365,
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
