import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Simple email capture for demo engagement tracking.
// NOTE: No email library is installed, so this does NOT send any
// email. It logs the capture server-side and returns success. When
// you add an email provider (Resend, SendGrid, etc.), wire it here.

const captureSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  source: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = await rateLimit(`demo-capture:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Log the capture. Replace with actual email list integration.
  console.log("[demo-capture]", {
    email: parsed.data.email,
    source: parsed.data.source ?? "unknown",
    ip,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
