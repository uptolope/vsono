-- Schema-drift fix: the Stripe webhook reads/writes "StripeWebhookEvent" for
-- idempotency (and schema.prisma defines it) but no migration ever created the
-- table. On a database built from migrations alone, EVERY webhook would fail
-- with 500 and no purchase would ever be fulfilled.
--
-- Idempotent (IF NOT EXISTS) so it is a no-op where the table already exists
-- (e.g. a database that was synced with `prisma db push`).

CREATE TABLE IF NOT EXISTS "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_type_idx"
    ON "StripeWebhookEvent"("type");

-- schema.prisma declares Purchase.stripePaymentIntentId @unique (the refund /
-- dispute handlers look purchases up with findUnique on it); the baseline only
-- created a non-unique index.
CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_stripePaymentIntentId_key"
    ON "Purchase"("stripePaymentIntentId");
