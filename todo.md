# SonoPrep — Todo

This file was stale — it listed "missing files" that already existed in the
codebase and a security audit that had already happened. Replaced with what's
actually outstanding as of August 2026.

## Before deploying
- [ ] **Rotate every credential from the old `.env.local`/`.env.production`**
      before doing anything else. Those files contained a live Stripe
      secret key, a live database URL, `NEXTAUTH_SECRET`, and the Resend
      key, and were removed from this repo/zip for that reason — assume
      they're compromised and roll all of them in their respective
      dashboards.
- [ ] Set the rotated `DATABASE_URL`, `NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`,
      `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, and `STRIPE_PRICE_*` values
      in Vercel's environment variable settings (Production + Preview) —
      see `.env.example` for the full list. Do not put real values in a
      committed file again.
- [ ] Run `npx prisma generate` and `npx prisma migrate deploy` against the
      real `DATABASE_URL`. This applies the 30/45-day access-window fix and
      the new `rate_limit_buckets` table.
- [ ] Test the full checkout → webhook → access-grant flow in Stripe TEST
      MODE before flipping to live keys. The Stripe API version jumped from
      `2025-02-24.acacia` to `2026-07-29.dahlia` (SDK v17 → v22) — the
      specific calls this app makes are stable, low-surface APIs, but that's
      not the same as verified. Don't skip the test-mode run.

- [ ] After deploy, verify in SQL that every COMPLETED bundle purchase has
      `accessExpiresAt - accessGrantedAt >= 45 days` (migration
      `20260929180000_guarantee_bundle_45_days`).
- [ ] Migrations `20260929175000`/`20260929180000` are idempotent, but the
      baseline migration has other drift vs `schema.prisma` (e.g. table names
      `flashcard_progress`/`flashcard_reviews`, `Purchase` defaults). Run
      `prisma migrate diff --from-url $DATABASE_URL --to-schema-datamodel
      prisma/schema.prisma` against a staging copy and reconcile.
- [ ] SEO backlog: see `docs/SEO-AUDIT-2026-09-29.md` (Search Console data needed).

## Product gaps found 2026-09-29 (see docs/GROWTH-IMPLEMENTATION-2026-09-29.md)
- [ ] Exam bank does not follow the SPI V24.1 weights: bank tags are 55/14/40/42/4 of 155
      (Doppler 27% vs 34% official, Safety ≈2.6% vs 10%) and use pre-V24.1 domain names.
      Add questions for Domain 5/2/4, retag to V24.1 domains, then do a stratified draw.
      Until then marketing must not claim "weighted to the real exam".
- [ ] Confirm the "credentialed/RDMS sonographers reviewed" and "independently written
      questions" claims are accurate and licensed (question bank header cites an external PDF).
- [ ] Lead nurture is dark: set LEAD_NURTURE_ENABLED, MAIL_POSTAL_ADDRESS, CRON_SECRET.
- [ ] Consider double opt-in if EU/UK traffic appears.

## Nice to have, not blocking
- [ ] CSRF middleware / explicit SameSite=Strict verification
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `GA_API_SECRET` (analytics is wired, dormant until set)
- [ ] Optional: set `UPSTASH_REDIS_REST_URL`/`TOKEN` to move rate limiting
      off Postgres onto Redis at higher scale. Not required for correctness
      — the Postgres fallback is a real shared counter, not a stopgap —
      just lower DB load if login/signup traffic gets heavy.

## Done (kept here so it's clear this isn't still open)
- [x] Rate limiting fixed for real: the in-memory fallback (broken across
      Vercel's multiple serverless instances — an attacker could bypass it
      by spreading requests across instances) has been deleted, not layered
      under a fix. Falls back to a Postgres-backed atomic counter
      (`rate_limit_buckets` table) instead, which is correctly shared
      across instances with zero setup. Upstash Redis is still used
      automatically when configured, as a faster/lower-DB-load option.
- [x] 30-day (individual) / 45-day (bundle) access windows — confirmed as a
      deliberate decision (2026-08-24), not a default. See STATUS.md.
- [x] IP-based rate limit on login (was previously account-lockout only)
- [x] Stripe API version updated and SDK bumped to match
- [x] `emailVerified` enforced at login, with a resend-verification flow
- [x] Dead orphaned `src/app/products/page-client.tsx` deleted
- [x] CSP hardened: nonce-based, `'unsafe-inline'` removed from `script-src`
- [x] Duplicate root-level `app/` directory deleted (was silently shadowing
      all of `src/app/` per Next.js's own resolution rules — the entire
      real application would never have run in production)
