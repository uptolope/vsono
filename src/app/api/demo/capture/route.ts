import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { captureLead, normalizeLeadSource } from "@/lib/leads";

export const runtime = "nodejs";

const captureSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  source: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // NOTE: this key used to be written as `demo-capture:\${ip}` (escaped), so
  // every visitor shared ONE bucket and the whole site was capped at 5 lead
  // captures per hour.
  const limit = await rateLimit(`demo-capture:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 },
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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await captureLead({
      email: parsed.data.email,
      source: normalizeLeadSource(parsed.data.source),
    });
  } catch (error) {
    // Never block the visitor's experience on the marketing call.
    console.error("[demo-capture] failed:", error);
  }

  return NextResponse.json({ success: true });
}
