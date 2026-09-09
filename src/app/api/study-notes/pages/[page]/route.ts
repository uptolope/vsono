import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContentAccess } from "@/lib/content/access-check";
import { rateLimit } from "@/lib/rate-limit";
import {
  SONOGRAPHIC_PHYSICS_PRODUCT_KEY,
  blobPathForPage,
  parsePageParam,
} from "@/lib/content/sonographic-physics";

// Private Blob objects are fetched server-side and streamed through
// this route — the browser never sees a direct Blob URL, so a
// signed/guessed Blob URL alone can't bypass entitlement checks.
//
// Every request is re-validated against session + checkContentAccess
// on every call (no caching of the access decision across requests).

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const session = await getServerSession(authOptions);

  // IDOR guard: userId comes only from the authenticated session,
  // never from a query param, header, or the route's [page] segment.
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await rateLimit(`study-notes-pages:${userId}`, {
    limit: 300,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    console.warn(`[study-notes/pages] Rate limit exceeded for user ${userId}`);
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const access = await checkContentAccess(userId, SONOGRAPHIC_PHYSICS_PRODUCT_KEY);
  if (!access.hasAccess) {
    console.warn(
      `[study-notes/pages] Access denied for user ${userId}: ${access.reason}`
    );
    return NextResponse.json(
      { error: "Access denied", reason: access.reason },
      { status: 403 }
    );
  }

  const { page: rawPage } = await params;

  // Strict validation: only a plain integer string in [1, pageCount]
  // is accepted. This is also what blocks path traversal — anything
  // that isn't `^[0-9]+$` (e.g. "../", encoded slashes, non-numeric
  // ids) is rejected before it ever touches a Blob path, and the
  // resulting path is always the fixed, server-controlled
  // `blobPathForPage(n)` scheme — there is no code path where
  // client input is interpolated directly into a Blob pathname.
  const pageNum = parsePageParam(rawPage);
  if (pageNum === null) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error("[study-notes/pages] BLOB_READ_WRITE_TOKEN is not configured");
    return NextResponse.json({ error: "Content not available" }, { status: 500 });
  }

  let head;
  try {
    const { head: headBlob } = await import("@vercel/blob");
    head = await headBlob(blobPathForPage(pageNum), { token: blobToken });
  } catch (err) {
    console.error(`[study-notes/pages] Blob lookup failed for page ${pageNum}:`, err);
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  if (!head?.url) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Fetch the private object server-side and stream the bytes back.
  // The client only ever sees this route's own response body — never
  // the underlying (private, tokenless-but-obscure) Blob URL.
  const blobRes = await fetch(head.url);
  if (!blobRes.ok || !blobRes.body) {
    console.error(
      `[study-notes/pages] Failed to fetch blob for page ${pageNum}: ${blobRes.status}`
    );
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  console.info(`[study-notes/pages] Serving page ${pageNum} to user ${userId}`);

  return new NextResponse(blobRes.body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      // Private per-user content — do not let any shared/proxy cache
      // serve one user's fetch of a page to a different user.
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
