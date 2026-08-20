# SonoPrep — Current Status

Last updated: August 2026

## What's built and verified

### Backend (all server-side, verified by code reading)
- **Auth** (`src/lib/auth.ts`): credentials login via NextAuth, bcrypt cost 12,
  account lockout after 5 failed attempts per account (15 min), a SEPARATE
  IP-based rate limit (15 attempts/15 min) to stop password-spraying across
  many accounts, single active-session enforcement, generic error messages
  (no email enumeration). Login is blocked with `EMAIL_NOT_VERIFIED` until
  the account's email is verified — see Email verification below.
- **Signup** (`src/app/api/auth/signup/route.ts`): Zod validation, rate-limited
  by IP, deliberately vague response to prevent enumeration.
- **Email verification**: signup sends a verification email (Resend) with a
  24-hour token. Login is now BLOCKED until that link is clicked
  (`user.emailVerified` checked in `authorize()`). If someone doesn't verify,
  `/api/auth/resend-verification` lets them request a new link — rate
  limited, generic response, doesn't leak account existence.
- **Password reset**: forgot-password + reset-password API routes, Resend email,
  secure random token stored in VerificationToken, 1-hour expiry, used token
  deleted after reset, lockout state cleared on reset.
- **Checkout** (`src/app/api/checkout/route.ts`): client sends product key only,
  price resolved exclusively from server-side `PRODUCT_PRICE_MAP`.
- **Stripe webhook** (`src/app/api/webhooks/stripe/route.ts`): raw-body
  signature verification, server-side access window calculation. Handles
  `checkout.session.completed`, `charge.refunded`, and `charge.dispute.created`.
  Refunds revoke access immediately. 10-day refund window (policy-level).
  Pinned to Stripe API version `2026-07-29.dahlia` (`stripe` npm package v22+,
  bumped from v17 to support it) — TEST IN STRIPE TEST MODE before deploying,
  this crossed at least one breaking-change release from the old pinned version.
- **Content access control** (`src/lib/content/access-check.ts`): checks
  purchase + expiry server-side. Bundle includes all four products.
- **Content API** (`src/app/api/content/[product]/route.ts`): strips
  `correctAnswer` from exam questions before sending to client.
- **Exam submission** (`src/app/api/exam/submit/route.ts`): server-side grading
  against the real question bank. Ignores unknown question IDs.
- **Account data export** (`src/app/api/account/data/route.ts`): scoped to
  session user only.
- **Account soft-delete** (`src/app/api/account/delete/route.ts`): email
  confirmation step, anonymizes PII, clears session.
- **Email** (`src/lib/email.ts`): Resend integration for password reset and
  email verification.
- **Prisma schema** (`prisma/schema.prisma`): User, Account, Session,
  VerificationToken, Purchase models. PostgreSQL — NOT Supabase-specific.
  There's no `@supabase/supabase-js` anywhere in this codebase; Prisma talks
  to plain Postgres over `DATABASE_URL`. Supabase CAN be the Postgres host
  behind that URL, but as of this zip, `DATABASE_URL` isn't set anywhere
  (checked `.env.local` directly) — no database is currently connected.
  Confirm your actual DB host and put the real connection string in your
  deployment env vars.
- **Rate limiting** (`src/lib/rate-limit.ts`): Upstash Redis-backed when
  `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are set (works
  correctly across serverless instances on Vercel). Falls back to an
  in-memory counter if those aren't set — fine for local dev, NOT sufficient
  in production (each serverless instance gets its own counter). Set the
  Upstash env vars before you rely on this in production; free tier at
  console.upstash.com is enough for this app's traffic.
- **Security headers** (`next.config.ts` + `src/middleware.ts`): X-Frame-Options,
  HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy all in
  `next.config.ts`. CSP moved to `src/middleware.ts` so it can use a
  per-request nonce — `script-src` no longer allows `'unsafe-inline'`; every
  inline JSON-LD `<script>` (layout.tsx, faq-schema.tsx, BlogPostLayout.tsx)
  carries a matching `nonce` read via `next/headers`.

### Frontend
- **Marketing pages**: home (hero + email capture), products, demo, terms,
  privacy, 9 blog posts, error, 404.
- **Auth pages**: `/login`, `/signup`, `/forgot-password`, `/reset-password` —
  full credentials + recovery flow. Login form now handles `ACCOUNT_LOCKED`,
  `EMAIL_NOT_VERIFIED` (with a resend-verification link), and
  `LOGIN_RATE_LIMITED` as distinct states.
- **Account page**: `/account` — shows active products, data export, sign out,
  account deletion with confirmation.
- **Demo page**: `/demo` — exam simulator + flashcard viewer with original
  demo content (not from paid bank). Email capture after 25s engagement.
- **UI primitives**: Button (with asChild), Badge, Card, Tabs — lightweight,
  matching the design system.
- **Layout**: Header (nav + mobile menu), Footer.
- **SessionProvider**: wired in root layout.
- **Products page** (`src/app/products/page.tsx`): the ONLY live products
  route — it's fully self-contained and already calls `/api/checkout`
  correctly. The old `src/app/products/page-client.tsx` was a second,
  never-imported, orphaned implementation whose purchase handler ignored
  which product was clicked and just redirected to `/signup` — it has been
  deleted. If you're looking for the products page logic, `page.tsx` is the
  only file that matters.

### Content
- 111 exam questions, 200 flashcards, 50 Physics Pearls, 10 study note chapters
  — all server-side only.
- 5 demo exam questions + 10 demo flashcards — original, client-safe.

## Known gaps — not yet built
1. **No CSRF middleware**: relies on NextAuth's default SameSite cookie.
   Should be explicitly verified or switched to SameSite=Strict.
2. **Prisma client must be generated**: run `npx prisma generate` and
   `npx prisma db push` (or `migrate`) against a real DATABASE_URL — none is
   currently set (see database note above).
3. **Analytics stubs**: `src/lib/analytics.ts` logs to console only.
   Wire to Plausible/PostHog/etc.
4. **Access windows are short relative to typical exam-prep study
   timelines** (see Business decisions below) — this is a product/pricing
   question, not a code bug, but worth deciding on deliberately rather than
   by default.

## Required environment variables
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random 32+ char string>
NEXTAUTH_URL=https://sonoprep.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FLASHCARDS=price_...
STRIPE_PRICE_EXAM=price_...
STRIPE_PRICE_PEARLS=price_...
STRIPE_PRICE_NOTES=price_...
STRIPE_PRICE_BUNDLE=price_...
RESEND_API_KEY=re_...
EMAIL_FROM=SonoPrep <noreply@sonoprep.com>
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## Stripe webhook events to register
In your Stripe dashboard → Webhooks, register these events:
- `checkout.session.completed`
- `charge.refunded`
- `charge.dispute.created`

## Business decisions to confirm
- Access starts at purchase (current code + ToS). If you want first-login,
  change the webhook and ToS section 5.
- 10-day refund window (ToS + webhook code match).
- Purchase rows are retained on account deletion (for tax/legal). Confirm
  retention policy.
- **Premium Bundle = 45-day access. Individual products = 30-day access.**
  (This previously said 120/90 days here — that was wrong; it never matched
  the actual code in `PRODUCT_PRICE_MAP`, which has always been 45/30. The
  live `/products` page copy was already correct at 30/45 — only this doc
  was wrong.) Worth reconsidering deliberately: ARDMS SPI candidates
  typically study over 6–12 weeks, so a 30-day window on a $24–50 product
  risks people losing access mid-study-plan, which shows up as refund
  requests and bad reviews rather than a code problem. Decide with real
  usage data if you have it, not by default.
