-- Double opt-in for marketing email.
--
-- Subscribers that pre-date this migration have confirmedAt = NULL and
-- confirmationSentAt = NULL. They were already finished (nurtureStep = 3) and
-- the nurture cron only emails CONFIRMED addresses, so they receive nothing.
-- They can opt in again by submitting a form and clicking the confirmation link.

ALTER TABLE "subscribers"
  ADD COLUMN IF NOT EXISTS "confirmationSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
