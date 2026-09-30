import { NextRequest, NextResponse } from "next/server";
import { verifyConfirmToken } from "@/lib/confirm-token";
import { confirmLead } from "@/lib/leads";
import { getAppUrl } from "@/lib/site-url";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

function back(status: string) {
  return NextResponse.redirect(
    new URL(`/confirm?status=${status}`, getAppUrl()),
    303,
  );
}

/**
 * POST only (the button on /confirm). GET does nothing, so email link
 * scanners that prefetch URLs can't confirm an address by accident.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const email = String(form?.get("e") ?? "").trim().toLowerCase();
  const token = String(form?.get("t") ?? "");
  const expires = Number(form?.get("x") ?? NaN);

  if (!email || !token) return back("invalid");

  const check = verifyConfirmToken(email, expires, token);

  if (!check.valid) return back("invalid");
  if (check.expired) return back("expired");

  // Only signed, unexpired links reach the (DB-backed) rate limiter.
  try {
    const limit = await rateLimit(`confirm:${getClientIp(req.headers)}`, {
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });

    if (!limit.allowed) return back("error");

    const result = await confirmLead(email);

    switch (result) {
      case "confirmed":
      case "already":
        return back("done");
      case "unsubscribed":
        return back("unsubscribed");
      default:
        // Purged or never existed: ask them to sign up again.
        return back("expired");
    }
  } catch (error) {
    console.error("[confirm] failed:", error);
    return back("error");
  }
}
