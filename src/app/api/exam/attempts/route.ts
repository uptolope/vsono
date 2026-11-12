import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAttemptStatus } from "@/lib/exam/attempts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only attempt allowance for the signed-in user. Never starts an attempt. */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = await getAttemptStatus(userId);

    return NextResponse.json(
      {
        hasAccess: status.hasAccess,
        limit: status.limit,
        used: status.used,
        remaining: status.remaining,
        active: status.active
          ? {
              attemptNumber: status.active.attemptNumber,
              startedAt: status.active.startedAt,
              resumableUntil: status.active.resumableUntil,
            }
          : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[exam/attempts] Error:", error);
    return NextResponse.json(
      { error: "Failed to load attempt status" },
      { status: 500 },
    );
  }
}
