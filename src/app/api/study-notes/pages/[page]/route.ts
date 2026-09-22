import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import sharp from "sharp";

import { authOptions } from "@/lib/auth";
import { checkContentAccess } from "@/lib/content/access-check";
import { rateLimit } from "@/lib/rate-limit";
import {
  SONOGRAPHIC_PHYSICS_META,
  SONOGRAPHIC_PHYSICS_PRODUCT_KEY,
  blobPathForPage,
  parsePageParam,
} from "@/lib/content/sonographic-physics";

export const runtime = "nodejs";

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createWatermarkSvg(
  identifier: string,
  pageNumber: number,
  accessDate: string,
  width: number,
  height: number,
): Buffer {
  const safeIdentifier = escapeXml(identifier);
  const safeDate = escapeXml(accessDate);
  const safePage = escapeXml(String(pageNumber));
  const safeWatermarkText = escapeXml(
    SONOGRAPHIC_PHYSICS_META.watermarkText,
  );


  const patternWidth = Math.max(900, Math.round(width * 0.75));
  const patternHeight = Math.max(520, Math.round(height * 0.30));



  const mainFontSize = Math.max(22, Math.round(width * 0.023));
  const secondaryFontSize = Math.max(18, Math.round(width * 0.018));
  const footerFontSize = Math.max(20, Math.round(width * 0.02));

  const footerY = Math.max(60, height - Math.round(height * 0.035));

  return Buffer.from(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      <defs>
        <pattern
          id="watermark"
          width="${patternWidth}"
          height="${patternHeight}"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-30)"
        >
          <text
            x="20"
            y="${Math.round(patternHeight * 0.5)}"
            fill="#222222"

            fill-opacity="0.055"

            fill-opacity="0.18"

            font-family="Arial, Helvetica, sans-serif"
            font-size="${mainFontSize}"
            font-weight="600"
          >
            Licensed access  ${safeIdentifier}
          </text>

          <text
            x="20"
            y="${Math.round(patternHeight * 0.68)}"
            fill="#222222"

            fill-opacity="0.055"

            fill-opacity="0.18"

            font-family="Arial, Helvetica, sans-serif"
            font-size="${secondaryFontSize}"
          >
            Page ${safePage}  ${safeDate}
          </text>
        </pattern>
      </defs>

      <rect
        x="0"
        y="0"
        width="${width}"
        height="${height}"
        fill="url(#watermark)"
      />

      <text
        x="${Math.round(width / 2)}"
        y="${footerY}"
        text-anchor="middle"
        fill="#222222"

        fill-opacity="0.28"

        fill-opacity="0.68"

        font-family="Arial, Helvetica, sans-serif"
        font-size="${footerFontSize}"
      >
        ${safeWatermarkText}
      </text>
    </svg>
  `);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ page: string }> },
) {
  const session = await getServerSession(authOptions);

  const user = session?.user as
    | {
        id?: string;
        email?: string | null;
      }
    | undefined;

  const userId = user?.id;

  if (!userId) {
    return jsonError({ error: "Unauthorized" }, 401);
  }

  const { page: rawPage } = await params;
  const pageNum = parsePageParam(rawPage);

  if (pageNum === null) {
    return jsonError({ error: "Invalid page number" }, 400);
  }

  const limit = await rateLimit(`study-notes-pages:${userId}`, {
    limit: 300,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return jsonError({ error: "Rate limited" }, 429, {
      "Retry-After": "60",
    });
  }

  const access = await checkContentAccess(
    userId,
    SONOGRAPHIC_PHYSICS_PRODUCT_KEY,
  );

  if (!access.hasAccess) {
    return jsonError(
      {
        error: "Access denied",
        reason: access.reason,
      },
      403,
    );
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    console.error(
      "[study-notes/pages] BLOB_READ_WRITE_TOKEN is not configured",
    );

    return jsonError({ error: "Content not available" }, 500);
  }

  const pathname = blobPathForPage(pageNum);

  try {
    const result = await get(pathname, {
      access: "private",
      token: blobToken,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      console.error("[study-notes/pages] Blob unavailable", {
        pageNum,
        pathname,
        statusCode: result?.statusCode,
        hasStream: Boolean(result?.stream),
      });

      return jsonError({ error: "Content not available" }, 404);
    }

    const contentType = result.blob?.contentType?.toLowerCase();

    if (contentType !== undefined && contentType !== "image/png") {
      console.error("[study-notes/pages] Unexpected Blob content type", {
        pageNum,
        pathname,
        contentType,
      });

      return jsonError({ error: "Content not available" }, 500);
    }

    const sourceBuffer = Buffer.from(
      await new Response(result.stream).arrayBuffer(),
    );

    const metadata = await sharp(sourceBuffer).metadata();

    if (!metadata.width || !metadata.height) {
      console.error("[study-notes/pages] Invalid image dimensions", {
        pageNum,
        pathname,
        width: metadata.width,
        height: metadata.height,
      });

      return jsonError({ error: "Invalid image" }, 500);
    }

    /*
     * Use the verified session identity.
     * Never use a client-supplied identifier for the watermark.
     */
    const accountIdentifier = user.email ?? userId;
    const accessDate = new Date().toISOString().slice(0, 10);

    const watermarkSvg = createWatermarkSvg(
      accountIdentifier,
      pageNum,
      accessDate,
      metadata.width,
      metadata.height,
    );

    const watermarkedImage = await sharp(sourceBuffer)
      .composite([
        {
          input: watermarkSvg,
          blend: "over",
        },
      ])
      .png()
      .toBuffer();

    return new NextResponse(watermarkedImage, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(watermarkedImage.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("[study-notes/pages] Watermarked image failed", {
      pageNum,
      pathname,
      error: error instanceof Error ? error.message : String(error),
    });

    return jsonError({ error: "Content unavailable" }, 500);
  }
}
