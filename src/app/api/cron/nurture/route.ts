import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  FOLLOW_UPS,
  isNurtureEnabled,
  sendLeadEmail,
} from "@/lib/lead-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
const BATCH_SIZE = 50;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) return false;

  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);

  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Daily cron (vercel.json). Sends the next follow-up email to subscribers
 * whose nextNurtureAt has passed. Does nothing unless LEAD_NURTURE_ENABLED=true
 * and MAIL_POSTAL_ADDRESS is configured.
 */
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isNurtureEnabled()) {
    return NextResponse.json({ skipped: "nurture disabled or MAIL_POSTAL_ADDRESS missing" });
  }

  const now = new Date();

  const due = await prisma.subscriber.findMany({
    where: {
      unsubscribedAt: null,
      nextNurtureAt: { lte: now },
      nurtureStep: { lt: FOLLOW_UPS.length },
    },
    orderBy: { nextNurtureAt: "asc" },
    take: BATCH_SIZE,
    select: { id: true, email: true, nurtureStep: true },
  });

  let sent = 0;
  let skippedCustomers = 0;
  let failed = 0;

  for (const lead of due) {
    // Stop marketing to people who already bought.
    const customer = await prisma.user.findFirst({
      where: {
        email: lead.email,
        purchases: { some: { status: "COMPLETED" } },
      },
      select: { id: true },
    });

    if (customer) {
      await prisma.subscriber.update({
        where: { id: lead.id },
        data: { nurtureStep: FOLLOW_UPS.length, nextNurtureAt: null },
      });
      skippedCustomers += 1;
      continue;
    }

    const plan = FOLLOW_UPS[lead.nurtureStep];

    // Claim the row so an overlapping run can't send the same email twice.
    const claimed = await prisma.subscriber.updateMany({
      where: {
        id: lead.id,
        nurtureStep: lead.nurtureStep,
        nextNurtureAt: { lte: now },
        unsubscribedAt: null,
      },
      data: { nextNurtureAt: null },
    });

    if (claimed.count !== 1) continue;

    try {
      await sendLeadEmail(plan.step, lead.email);

      await prisma.subscriber.update({
        where: { id: lead.id },
        data: {
          nurtureStep: lead.nurtureStep + 1,
          nextNurtureAt:
            plan.nextInDays === null
              ? null
              : new Date(Date.now() + plan.nextInDays * DAY_MS),
        },
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error("[nurture] send failed:", error);

      // Retry tomorrow.
      await prisma.subscriber.update({
        where: { id: lead.id },
        data: { nextNurtureAt: new Date(Date.now() + DAY_MS) },
      });
    }
  }

  return NextResponse.json({ due: due.length, sent, skippedCustomers, failed });
}
