import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { getAppUrl } from "@/lib/site-url";

export const runtime = "nodejs";

/**
 * POST only. Used both by the confirm button on /unsubscribe and by mail
 * clients' one-click unsubscribe (RFC 8058: POST with
 * `List-Unsubscribe=One-Click`). GET deliberately does nothing so link
 * scanners that prefetch URLs can't unsubscribe people by accident.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  let email = url.searchParams.get("e") ?? "";
  let token = url.searchParams.get("t") ?? "";
  let oneClick = false;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData().catch(() => null);

    if (form) {
      oneClick = form.get("List-Unsubscribe") === "One-Click";
      email = email || String(form.get("e") ?? "");
      token = token || String(form.get("t") ?? "");
    }
  }

  email = email.trim().toLowerCase();

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: "Invalid unsubscribe link." }, { status: 400 });
  }

  await prisma.subscriber.updateMany({
    where: { email, unsubscribedAt: null },
    data: { unsubscribedAt: new Date(), nextNurtureAt: null },
  });

  if (oneClick) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.redirect(new URL("/unsubscribe?done=1", getAppUrl()), 303);
}
