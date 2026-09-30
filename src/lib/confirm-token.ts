import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppUrl } from "@/lib/site-url";

/** How long a confirmation link stays valid. */
export const CONFIRM_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET;

  if (!value) {
    throw new Error("NEXTAUTH_SECRET is required to sign confirmation links");
  }

  return value;
}

function sign(email: string, expires: number): string {
  // The "confirm:" prefix keeps these tokens distinct from unsubscribe tokens.
  return createHmac("sha256", secret())
    .update(`confirm:${email.trim().toLowerCase()}:${expires}`)
    .digest("base64url");
}

export function confirmToken(email: string, expires: number): string {
  return sign(email, expires);
}

export function verifyConfirmToken(
  email: string,
  expires: number,
  token: string,
): { valid: boolean; expired: boolean } {
  try {
    if (!Number.isFinite(expires)) return { valid: false, expired: false };

    const expected = Buffer.from(sign(email, expires));
    const given = Buffer.from(token);
    const ok =
      expected.length === given.length && timingSafeEqual(expected, given);

    if (!ok) return { valid: false, expired: false };

    return { valid: true, expired: Date.now() > expires };
  } catch {
    return { valid: false, expired: false };
  }
}

/**
 * Link in the confirmation email. It opens a page with a confirm BUTTON
 * (POST) rather than confirming on GET, so email security scanners that
 * prefetch links can't confirm an address on the owner's behalf.
 */
export function confirmPageUrl(email: string): string {
  const expires = Date.now() + CONFIRM_LINK_TTL_MS;

  return (
    `${getAppUrl()}/confirm` +
    `?e=${encodeURIComponent(email)}&x=${expires}&t=${confirmToken(email, expires)}`
  );
}
