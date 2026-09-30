-- Lead follow-up sequence state + unsubscribe support for marketing email.
--
-- Existing subscribers are deliberately NOT enrolled: they signed up before
-- the sequence existed, so they're marked finished (nurtureStep = 3) and will
-- never receive follow-ups unless you enrol them on purpose, e.g.
--   UPDATE "subscribers" SET "nurtureStep" = 0,
--          "nextNurtureAt" = now() WHERE "unsubscribedAt" IS NULL AND ...;

ALTER TABLE "subscribers"
  ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS "nurtureStep" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "nextNurtureAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "unsubscribedAt" TIMESTAMP(3);

UPDATE "subscribers" SET "nurtureStep" = 3 WHERE "nurtureStep" = 0;

CREATE INDEX IF NOT EXISTS "subscribers_nextNurtureAt_idx"
  ON "subscribers"("nextNurtureAt");
