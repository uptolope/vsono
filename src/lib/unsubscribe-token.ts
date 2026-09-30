import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppUrl } from "@/lib/site-url";

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET;

  if (!value) {
    throw new Error("NEXTAUTH_SECRET is required to sign unsubscribe links");
  }

  return value;
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret())
    .update(`unsubscribe:${email.trim().toLowerCase()}`)
    .digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  try {
    const expected = Buffer.from(unsubscribeToken(email));
    const given = Buffer.from(token);

    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

/** Landing page with a confirm button (safe against link-scanner prefetch). */
export function unsubscribePageUrl(email: string): string {
  return (
    `${getAppUrl()}/unsubscribe` +
    `?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`
  );
}

/** RFC 8058 one-click endpoint (POST), referenced by List-Unsubscribe. */
export function unsubscribeApiUrl(email: string): string {
  return (
    `${getAppUrl()}/api/unsubscribe` +
    `?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`
  );
}
