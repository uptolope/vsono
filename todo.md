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

## Nice to have, not blocking
- [ ] CSRF middleware / explicit SameSite=Strict verification
- [ ] Wire `src/lib/analytics.ts` to a real analytics provider (currently
      console-only stubs)
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
