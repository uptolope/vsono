import "server-only";

import Stripe from "stripe";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const STRIPE_API_VERSION = "2026-08-26.dahlia" as const;

const REQUIRED_STRIPE_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_FLASHCARDS",
  "STRIPE_PRICE_EXAM_SIMULATOR",
  "STRIPE_PRICE_PHYSICS_PEARLS",
  "STRIPE_PRICE_STUDY_NOTES",
  "STRIPE_PRICE_PREMIUM_BUNDLE",
  "STRIPE_WEBHOOK_SECRET",
] as const;

function getMissingStripeEnvVars(): string[] {
  return REQUIRED_STRIPE_ENV_VARS.filter(
    (key) => !process.env[key]?.trim()
  );
}

function validateStripeEnvVars(): void {
  // Do not fail during next build, because build environments may not
  // contain production secrets.
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return;
  }

  const missing = getMissingStripeEnvVars();

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    throw new Error(
      `Missing required Stripe environment variables: ${missing.join(", ")}`
    );
  }
}

validateStripeEnvVars();

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripe) {
    return stripe;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  stripe = new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
  });

  return stripe;
}

export const PRODUCT_PRICE_MAP = {
  FLASHCARDS: {
    priceId: process.env.STRIPE_PRICE_FLASHCARDS?.trim() ?? "",
    accessDays: 30,
  },
  EXAM_SIMULATOR: {
    priceId: process.env.STRIPE_PRICE_EXAM_SIMULATOR?.trim() ?? "",
    accessDays: 30,
  },
  PHYSICS_PEARLS: {
    priceId: process.env.STRIPE_PRICE_PHYSICS_PEARLS?.trim() ?? "",
    accessDays: 30,
  },
  STUDY_NOTES: {
    priceId: process.env.STRIPE_PRICE_STUDY_NOTES?.trim() ?? "",
    accessDays: 30,
  },
  PREMIUM_BUNDLE: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_BUNDLE?.trim() ?? "",
    accessDays: 45,
  },
} as const;

export type ProductKey = keyof typeof PRODUCT_PRICE_MAP;

export const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";

export function getPriceEntry(productKey: ProductKey) {
  const entry = PRODUCT_PRICE_MAP[productKey];

  if (!entry.priceId) {
    throw new Error(
      `Missing Stripe price ID for product: ${productKey}`
    );
  }

  return entry;
}