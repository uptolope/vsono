import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContentAccess } from "@/lib/content/access-check";
import {
  SONOGRAPHIC_PHYSICS_META,
  SONOGRAPHIC_PHYSICS_PRODUCT_KEY,
} from "@/lib/content/sonographic-physics";

// Viewer metadata for the watermark overlay. The identity and access
// date shown to the client come only from the verified server-side
// session and current server time — never from any client-supplied
// value — so the watermark can't be spoofed by editing request data.

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const email = (session?.user as { email?: string } | undefined)?.email;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await checkContentAccess(userId, SONOGRAPHIC_PHYSICS_PRODUCT_KEY);
  if (!access.hasAccess) {
    return NextResponse.json(
      { error: "Access denied", reason: access.reason },
      { status: 403 }
    );
  }

  return NextResponse.json({
    title: SONOGRAPHIC_PHYSICS_META.title,
    shortTitle: SONOGRAPHIC_PHYSICS_META.shortTitle,
    pageCount: SONOGRAPHIC_PHYSICS_META.pageCount,
    downloadsEnabled: SONOGRAPHIC_PHYSICS_META.downloadsEnabled,
    watermarkText: SONOGRAPHIC_PHYSICS_META.watermarkText,
    // Server-verified identity only — not a client-editable field.
    accountIdentifier: email ?? userId,
    accessDate: new Date().toISOString(),
    expiresAt: access.expiresAt ?? null,
  });
}
