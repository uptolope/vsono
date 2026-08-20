import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// This protects PAGE routes only (redirect-to-login UX). It is not the
// security boundary — that's each API route calling getServerSession()
// itself, because middleware can be bypassed by hitting an API route
// directly, and because getToken() here doesn't re-check
// activeSessionId/deletedAt against the DB (Edge middleware can't do a
// DB round trip cheaply). Treat this as a UX convenience layered on
// top of the real per-route checks, not a replacement for them.
const PROTECTED_PATHS = ["/account"];

// ── CSP nonce ────────────────────────────────────────────────────
// Moved here from next.config.ts because a nonce has to be generated
// PER REQUEST — next.config.ts's headers() is static and can't do
// that. This is what lets us drop 'unsafe-inline' from script-src:
// every inline <script> in the app (the JSON-LD blocks in layout.tsx,
// faq-schema.tsx, BlogPostLayout.tsx) now renders with a matching
// nonce="..." attribute read via next/headers, and the browser only
// executes inline scripts whose nonce matches the one in this header.
// An attacker-injected <script> tag (e.g. via a stored-XSS bug
// somewhere) won't have the right nonce and won't run — that's the
// actual protection 'unsafe-inline' was giving up.
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://*.stripe.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "connect-src 'self' https://api.stripe.com",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export async function proxy(req: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp(nonce);

  const isProtected = PROTECTED_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));

  if (isProtected) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set("Content-Security-Policy", csp);
      return redirectResponse;
    }
  }

  // Pass the nonce forward two ways:
  //  - as a request header, so server components can read it via
  //    next/headers' headers() during this same request
  //  - as the actual CSP response header, so the browser enforces it
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Run on everything except static assets / Next internals — CSP
  // and the nonce need to apply site-wide, not just /account like the
  // old auth-only matcher did.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
