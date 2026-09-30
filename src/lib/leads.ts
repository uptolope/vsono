import "server-only";

import { prisma } from "@/lib/prisma";
import {
  FIRST_FOLLOW_UP_DELAY_DAYS,
  isNurtureEnabled,
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

/**
 * Records a marketing lead (one row per address) and, for a NEW address,
 * sends the welcome email.
 *
 * - An address that previously unsubscribed is never re-enrolled or emailed.
 * - Repeat submissions for a known address send nothing, so the form can't be
 *   used to mail someone else's inbox over and over.
 * - Follow-ups only happen when isNurtureEnabled() (LEAD_NURTURE_ENABLED=true
 *   and MAIL_POSTAL_ADDRESS set); otherwise the lead is stored with no
 *   follow-up scheduled and only the welcome email goes out (if possible).
 */
export async function captureLead(args: {
  email: string;
  source: LeadSource;
}): Promise<{ isNew: boolean; unsubscribed: boolean }> {
  const email = args.email.trim().toLowerCase();

  const existing = await prisma.subscriber.findUnique({
    where: { email },
    select: { id: true, unsubscribedAt: true },
  });

  if (existing) {
    return { isNew: false, unsubscribed: existing.unsubscribedAt !== null };
  }

  const enroll = isNurtureEnabled();

  await prisma.subscriber.create({
    data: {
      email,
      source: args.source,
      nurtureStep: enroll ? 0 : 3,
      nextNurtureAt: enroll
        ? new Date(Date.now() + FIRST_FOLLOW_UP_DELAY_DAYS * DAY_MS)
        : null,
    },
  });

  await prisma.demoLead.create({
    data: { email, source: args.source },
  });

  // Welcome email needs the postal address (CAN-SPAM); without it, skip
  // rather than send a non-compliant commercial message.
  if (process.env.MAIL_POSTAL_ADDRESS?.trim()) {
    try {
      await sendLeadEmail("welcome", email);
    } catch (error) {
      console.error("[leads] welcome email failed:", {
        emailDomain: email.split("@")[1] ?? "unknown",
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return { isNew: true, unsubscribed: false };
}
