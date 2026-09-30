import "server-only";

import { prisma } from "@/lib/prisma";
import {
  FIRST_FOLLOW_UP_DELAY_DAYS,
  isNurtureEnabled,
  sendConfirmationEmail,
  sendLeadEmail,
} from "@/lib/lead-emails";

const DAY_MS = 24 * 60 * 60 * 1000;

export type LeadSource =
  | "landing_page"
  | "demo_page"
  | "get_started"
  | "unknown";

export function normalizeLeadSource(value: string | undefined): LeadSource {
  switch (value) {
    case "landing_page":
    case "demo_page":
    case "get_started":
      return value;
    default:
      return "unknown";
  }
}

/** Don't re-send the confirmation request to the same address more than this often. */
const RESEND_CONFIRMATION_AFTER_MS = DAY_MS;

function hasPostalAddress(): boolean {
  return Boolean(process.env.MAIL_POSTAL_ADDRESS?.trim());
}

async function trySendConfirmation(email: string): Promise<boolean> {
  // Needs the postal address (CAN-SPAM); without it, store the lead but send
  // nothing rather than send a non-compliant message.
  if (!hasPostalAddress()) return false;

  try {
    await sendConfirmationEmail(email);
    await prisma.subscriber.update({
      where: { email },
      data: { confirmationSentAt: new Date() },
    });
    return true;
  } catch (error) {
    console.error("[leads] confirmation email failed:", {
      emailDomain: email.split("@")[1] ?? "unknown",
      error: error instanceof Error ? error.message : "unknown",
    });
    return false;
  }
}

/**
 * Records a marketing lead (one row per address) and starts DOUBLE OPT-IN:
 * the only email sent here is a confirmation request. No welcome email, tips
 * or follow-ups go out until the recipient clicks the confirmation link
 * (see confirmLead()).
 *
 * - An address that previously unsubscribed is never re-enrolled or emailed.
 * - An already-confirmed address gets nothing new.
 * - Re-submitting a still-unconfirmed address re-sends the confirmation at
 *   most once per 24 hours, so the form can't be used to mail someone's inbox
 *   repeatedly.
 */
export async function captureLead(args: {
  email: string;
  source: LeadSource;
}): Promise<{ isNew: boolean; unsubscribed: boolean; confirmed: boolean }> {
  const email = args.email.trim().toLowerCase();

  const existing = await prisma.subscriber.findUnique({
    where: { email },
    select: { unsubscribedAt: true, confirmedAt: true, confirmationSentAt: true },
  });

  if (existing) {
    const unsubscribed = existing.unsubscribedAt !== null;
    const confirmed = existing.confirmedAt !== null;

    if (!unsubscribed && !confirmed) {
      const last = existing.confirmationSentAt?.getTime() ?? 0;

      if (Date.now() - last > RESEND_CONFIRMATION_AFTER_MS) {
        await trySendConfirmation(email);
      }
    }

    return { isNew: false, unsubscribed, confirmed };
  }

  // Created NOT enrolled in the sequence (nurtureStep 3, nothing scheduled);
  // enrolment happens only when the address is confirmed.
  await prisma.subscriber.create({
    data: { email, source: args.source, nurtureStep: 3, nextNurtureAt: null },
  });

  await prisma.demoLead.create({
    data: { email, source: args.source },
  });

  await trySendConfirmation(email);

  return { isNew: true, unsubscribed: false, confirmed: false };
}

export type ConfirmResult = "confirmed" | "already" | "unsubscribed" | "unknown";

/**
 * Completes double opt-in for an address (called after the recipient clicks
 * the confirm button). Idempotent: the state change is one atomic update, so
 * double clicks and link-scanner replays send the welcome email only once.
 */
export async function confirmLead(rawEmail: string): Promise<ConfirmResult> {
  const email = rawEmail.trim().toLowerCase();

  const row = await prisma.subscriber.findUnique({
    where: { email },
    select: { unsubscribedAt: true, confirmedAt: true },
  });

  if (!row) return "unknown";
  if (row.unsubscribedAt) return "unsubscribed";
  if (row.confirmedAt) return "already";

  const enroll = isNurtureEnabled();

  const claimed = await prisma.subscriber.updateMany({
    where: { email, confirmedAt: null, unsubscribedAt: null },
    data: {
      confirmedAt: new Date(),
      nurtureStep: enroll ? 0 : 3,
      nextNurtureAt: enroll
        ? new Date(Date.now() + FIRST_FOLLOW_UP_DELAY_DAYS * DAY_MS)
        : null,
    },
  });

  if (claimed.count !== 1) return "already";

  if (hasPostalAddress()) {
    try {
      await sendLeadEmail("welcome", email);
    } catch (error) {
      console.error("[leads] welcome email failed:", {
        emailDomain: email.split("@")[1] ?? "unknown",
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return "confirmed";
}
