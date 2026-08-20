# SonoPrep — Todo

This file was stale — it listed "missing files" that already existed in the
codebase and a security audit that had already happened. Replaced with what's
actually outstanding as of August 2026.

## Before deploying
- [ ] Set `DATABASE_URL` — nothing is currently connected (checked
      `.env.local` directly, it's not there). Confirm whether you're using
      Supabase, Render, or something else, and point Prisma at it.
- [ ] Run `npx prisma generate` and `npx prisma db push` (or `migrate`)
      against that real `DATABASE_URL`.
- [ ] Set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (free tier at
      console.upstash.com) — rate limiting silently falls back to a
      per-instance in-memory counter without these, which does not work
      correctly on Vercel.
- [ ] Fill in all `STRIPE_PRICE_*` env vars with real Price IDs from your
      Stripe dashboard.
- [ ] Test the full checkout → webhook → access-grant flow in Stripe TEST
      MODE before flipping to live keys. The Stripe API version jumped from
      `2025-02-24.acacia` to `2026-07-29.dahlia` (SDK v17 → v22) — the
      specific calls this app makes are stable, low-surface APIs, but that's
      not the same as verified. Don't skip the test-mode run.
- [ ] Decide on the 30-day (individual) / 45-day (bundle) access windows —
      see STATUS.md "Business decisions to confirm." Not a code blocker, but
      worth deciding on purpose rather than by accident.

## Nice to have, not blocking
- [ ] CSRF middleware / explicit SameSite=Strict verification
- [ ] Wire `src/lib/analytics.ts` to a real analytics provider (currently
      console-only stubs)

## Done (kept here so it's clear this isn't still open)
- [x] Redis-backed rate limiting with in-memory dev fallback
- [x] IP-based rate limit on login (was previously account-lockout only)
- [x] Stripe API version updated and SDK bumped to match
- [x] `emailVerified` enforced at login, with a resend-verification flow
- [x] Dead orphaned `src/app/products/page-client.tsx` deleted
- [x] CSP hardened: nonce-based, `'unsafe-inline'` removed from `script-src`
