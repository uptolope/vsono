-- Data-fix migration: guarantee 45 days of access for every Premium Bundle
-- purchase, including customers who already bought.
--
-- Root cause: the Stripe webhook computed Purchase.accessExpiresAt from
-- Product.accessDurationDays. That column has a schema default of 30 and no
-- earlier migration created/populated it, so a Premium Bundle Product row that
-- was never (re)seeded granted only 30 days instead of 45. (The webhook now
-- takes the duration from code, src/lib/access-durations.ts.)
--
-- 1. Make sure Product.accessDurationDays exists and the bundle is at 45.
-- 2. Extend existing COMPLETED bundle purchases to accessGrantedAt + 45 days.
--
-- Safety:
--   * Only ever EXTENDS (accessExpiresAt < granted + 45d); never shortens.
--   * Only COMPLETED rows. REFUNDED / DISPUTED rows had accessExpiresAt forced
--     to the revocation time and must not be revived. PENDING rows have not
--     granted access yet.
--   * Idempotent: re-running changes nothing.

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "accessDurationDays" INTEGER NOT NULL DEFAULT 30;

UPDATE "Product"
SET "accessDurationDays" = 45
WHERE "type" = 'PREMIUM_BUNDLE'
  AND "accessDurationDays" <> 45;

UPDATE "Purchase" AS p
SET "accessExpiresAt" =
      COALESCE(p."accessGrantedAt", p."createdAt") + INTERVAL '45 days',
    "updatedAt" = CURRENT_TIMESTAMP
FROM "Product" AS pr
WHERE p."productId" = pr."id"
  AND pr."type" = 'PREMIUM_BUNDLE'
  AND p."status" = 'COMPLETED'
  AND (
    p."accessExpiresAt" IS NULL
    OR p."accessExpiresAt" <
         COALESCE(p."accessGrantedAt", p."createdAt") + INTERVAL '45 days'
  );
