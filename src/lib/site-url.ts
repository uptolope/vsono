// ═══════════════════════════════════════════════════════════════════
// Single source of truth for the site's own base URL.
//
// Previously this codebase read TWO different env vars for the same
// concept — NEXTAUTH_URL (checkout redirects, forgot-password) and
// NEXT_PUBLIC_APP_URL (verification/reset emails) — with inconsistent
// fallback behavior:
//   - checkout/route.ts interpolated NEXTAUTH_URL with NO fallback,
//     so a missing var produced "undefined/account?purchase=success"
//     as the Stripe success_url.
//   - email.ts fell back to a hardcoded "https://sonoprep.com".
// If you set one var and not the other, checkout and emails silently
// point to different places. This file fixes that: one function, one
// var, one real fallback, used everywhere a base URL is needed.
//
// NEXTAUTH_URL is still required separately — NextAuth itself reads
// it directly for its own internals. This helper is for YOUR links
// (Stripe redirects, email URLs), not NextAuth's.
// ═══════════════════════════════════════════════════════════════════

export function getAppUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://sonoprep.com";

  // Strip a trailing slash so callers can always safely do `${getAppUrl()}/path`
  // without risking a double slash.
  return url.replace(/\/$/, "");
}
