import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContentAccess } from "@/lib/content/access-check";
import {
  SONOGRAPHIC_PHYSICS_META,
  SONOGRAPHIC_PHYSICS_PRODUCT_KEY,
} from "@/lib/content/sonographic-physics";

// Viewer metadata for the watermark overlay.
//
// The identity and access date shown to the client come only from the
// verified server-side session and current server time. They are never
// accepted from client-supplied values, so the watermark cannot be
// spoofed by editing request data.

export async function GET() {
  const session = await getServerSession(authOptions);

  const user = session?.user as
    | {
        id?: string;
        email?: string;
      }
    | undefined;

  const userId = user?.id;
  const email = user?.email;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const access = await checkContentAccess(
    userId,
    SONOGRAPHIC_PHYSICS_PRODUCT_KEY
  );

  if (!access.hasAccess) {
    return NextResponse.json(
      {
        error: "Access denied",
        reason: access.reason,
      },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      title: SONOGRAPHIC_PHYSICS_META.title,
      shortTitle: SONOGRAPHIC_PHYSICS_META.shortTitle,
      category: SONOGRAPHIC_PHYSICS_META.category,
      pageCount: SONOGRAPHIC_PHYSICS_META.pageCount,
      downloadsEnabled: SONOGRAPHIC_PHYSICS_META.downloadsEnabled,
      watermarkText: SONOGRAPHIC_PHYSICS_META.watermarkText,

      // Server-verified identity only. This is not client-editable.
      accountIdentifier: email ?? userId,

      // Generated on the server for this metadata request.
      accessDate: new Date().toISOString(),

      // Null means access does not expire.
      expiresAt: access.expiresAt ?? null,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}