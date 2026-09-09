import { get } from "@vercel/blob";
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

const JSON_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

function jsonError(
  body: Record<string, unknown>,
  status: number,
  extraHeaders: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: {
      ...JSON_HEADERS,
      ...extraHeaders,
    },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ page: string }> },
) {
  /*
   * Authenticate the user.
   */
  const session = await getServerSession(authOptions);

  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return jsonError({ error: "Unauthorized" }, 401);
  }

  /*
   * Resolve and validate the page number.
   */
  const { page: rawPage } = await params;
  const pageNum = parsePageParam(rawPage);

  if (pageNum === null) {
    return jsonError({ error: "Invalid page number" }, 400);
  }

  /*
   * Rate-limit page requests.
   */
  const limit = await rateLimit(`study-notes-pages:${userId}`, {
    limit: 300,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    console.warn(
      `[study-notes/pages] Rate limit exceeded for user ${userId}`,
    );

    return jsonError({ error: "Rate limited" }, 429, {
      "Retry-After": "60",
    });
  }

  /*
   * Verify that the user has access to the product.
   */
  const access = await checkContentAccess(
    userId,
    SONOGRAPHIC_PHYSICS_PRODUCT_KEY,
  );

  if (!access.hasAccess) {
    console.warn(
      `[study-notes/pages] Access denied for user ${userId}: ${access.reason}`,
    );

    return jsonError(
      {
        error: "Access denied",
        reason: access.reason,
      },
      403,
    );
  }

  /*
   * Read the private Blob token.
   */
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    console.error(
      "[study-notes/pages] BLOB_READ_WRITE_TOKEN is not configured",
    );

    return jsonError({ error: "Content not available" }, 500);
  }

  /*
   * Generate the exact Blob pathname.
   *
   * Expected page 1 path:
   * page-0001.png
   */
  const pathname = blobPathForPage(pageNum);

  console.log("[study-notes/pages] Requested Blob path:", {
    pageNum,
    pathname,
  });

  /*
   * Read and stream the private Blob.
   */
  try {
    const result = await get(pathname, {
      access: "private",
      token: blobToken,
    });

    /*
     * The SDK may return null when the object is not found.
     * Check this before accessing result.statusCode.
     */
    if (!result) {
      console.error("[study-notes/pages] Blob returned null", {
        pageNum,
        pathname,
      });

      return jsonError(
        {
          error: "Blob not found",
          pageNum,
          pathname,
        },
        404,
      );
    }

    /*
     * Confirm that the Blob response contains a usable stream.
     */
    if (result.statusCode !== 200 || !result.stream) {
      console.error(
        `[study-notes/pages] Blob stream unavailable for page ${pageNum}`,
        {
          pageNum,
          pathname,
          statusCode: result.statusCode,
          hasStream: Boolean(result.stream),
        },
      );

      return jsonError(
        {
          error: "Blob stream unavailable",
          pageNum,
          pathname,
          statusCode: result.statusCode,
        },
        502,
      );
    }

    /*
     * The content type is stored inside result.blob.
     */
    const contentType = result.blob?.contentType?.toLowerCase();

    /*
     * Only serve PNG page images.
     */
    if (contentType && !contentType.startsWith("image/png")) {
      console.error(
        `[study-notes/pages] Unexpected content type for page ${pageNum}`,
        {
          pageNum,
          pathname,
          contentType,
        },
      );

      return jsonError(
        {
          error: "Unexpected content type",
          pageNum,
          pathname,
          contentType,
        },
        500,
      );
    }

    console.info(
      `[study-notes/pages] Serving page ${pageNum} to user ${userId}`,
    );

    /*
     * Stream the image to the browser.
     */
    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Content-Type": contentType || "image/png",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : String(error);

    console.error("[study-notes/pages] Blob read failed", {
      pageNum,
      pathname,
      error: errorDetails,
    });

    return jsonError(
      {
        error: "Blob read failed",
        pageNum,
        pathname,
        details: errorDetails,
      },
      500,
    );
  }
}