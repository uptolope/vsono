-- Data-fix migration (no schema change).
--
-- Root cause: PRODUCT_PRICE_MAP in src/lib/stripe.ts hardcoded
-- `accessDays: 365` for every product. The Stripe webhook
-- (checkout.session.completed) used that value to set
-- Purchase.accessExpiresAt, so every completed purchase processed
-- before this fix got 365 days of access instead of the correct
-- 30 days (individual products) or 45 days (Premium Bundle).
--
-- This migration recomputes accessExpiresAt for affected rows as
-- accessGrantedAt + 30/45 days, based on each purchase's Product type.
--
-- Scope guard: only rows whose window is longer than 90 days are
-- touched. That is well above the correct maximum (45 days), so it
-- cannot accidentally shorten a correctly-granted purchase, but is
-- comfortably below 365, so it reliably catches every row affected
-- by the bug even if some were completed a few days apart from each
-- other in wall-clock time.
--
-- Only COMPLETED purchases are touched. REFUNDED / DISPUTED purchases
-- already have accessExpiresAt forced to the revocation time by the
-- webhook's refund/dispute handlers and must not be extended back out
-- by this migration. PENDING purchases have not granted access yet
-- and are left for the (already-corrected) checkout flow to resolve.

UPDATE "Purchase" AS p
SET "accessExpiresAt" = p."accessGrantedAt" + (
  CASE
    WHEN pr."type" = 'PREMIUM_BUNDLE' THEN INTERVAL '45 days'
    ELSE INTERVAL '30 days'
  END
)
FROM "Product" AS pr
WHERE p."productId" = pr."id"
  AND p."status" = 'COMPLETED'
  AND p."accessExpiresAt" > (p."accessGrantedAt" + INTERVAL '90 days');
