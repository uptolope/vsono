import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountDeleteSchema } from "@/lib/validations";

// ⚠️ UNRESOLVED BUSINESS DECISION — read before relying on this route:
// This soft-deletes the account (blocks login and all content access —
// see the deletedAt check in the auth.ts jwt callback, which is the
// actual global enforcement point, not this route). It does NOT delete
// the Purchase rows. I did that deliberately, not by accident: Stripe
// payment records typically need to be retained for a period for tax
// and dispute purposes, and I don't know your retention policy or
// jurisdiction's requirement. If a regulator or a GDPR erasure request
// requires full purchase deletion rather than retention-with-
// anonymization, this route does not satisfy that yet — you need to
// confirm your actual legal retention requirement before this is
// GDPR-complete, not just GDPR-shaped.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const sessionEmail = session?.user?.email;
  if (!userId || !sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = accountDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Re-typing the email is a deliberate friction step, distinct from
  // just being logged in, so a hijacked/idle session can't trivially
  // trigger account deletion via a single forged request.
  if (parsed.data.confirmEmail.toLowerCase() !== sessionEmail.toLowerCase()) {
    return NextResponse.json({ error: "Email confirmation does not match." }, { status: 400 });
  }

  const anonymizedEmail = `deleted-${userId}@sonoprep.invalid`;

  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      email: anonymizedEmail,
      name: null,
      passwordHash: null,
      activeSessionId: null, // immediately invalidates any live session
    },
  });

  return NextResponse.json({ message: "Account deleted." });
}
