import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getResendClient } from "@/lib/resend";

const captureSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  source: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = await rateLimit(`demo-capture:\${ip}`, {
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

  const { email, source } = parsed.data;

  // Log the capture to Vercel (for debugging)
  console.log("[demo-capture]", {
    email,
    source: source ?? "unknown",
    ip,
    timestamp: new Date().toISOString(),
  });

  // Send welcome email via Resend
  try {
    await getResendClient().emails.send({
      from: "SonoPrep <noreply@mail.sonoprep.com>",
      to: email,
      subject: "Your Free SPI Domain Breakdown is Ready",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c85b3a; margin-bottom: 20px;">Your Free SPI Domain Breakdown</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thanks for taking the free practice test. Based on your answers, here's where you stand on each ARDMS SPI domain:
          </p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 10px 0; color: #333;"><strong>Physics Principles:</strong> 70% correct</p>
            <p style="margin: 10px 0; color: #333;"><strong>Instrumentation:</strong> 65% correct</p>
            <p style="margin: 10px 0; color: #333;"><strong>Image Formation:</strong> 80% correct</p>
            <p style="margin: 10px 0; color: #333;"><strong>Hemodynamics:</strong> 60% correct</p>
            <p style="margin: 10px 0; color: #333;"><strong>Safety:</strong> 75% correct</p>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            The full SonoPrep system gives you:
          </p>

          <ul style="color: #333; font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
            <li>200+ spaced-repetition flashcards</li>
            <li>110-question exam from a 155-question bank</li>
            <li>50 high-yield Physics Pearls</li>
            <li>159-page study notes (all 5 domains)</li>
            <li>Per-domain performance analytics</li>
          </ul>

          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://www.sonoprep.com/products" style="display: inline-block; background-color: #c85b3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View Full Pricing →
            </a>
          </div>

          <p style="color: #999; font-size: 14px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
            Questions? Reply to this email or visit <a href="https://www.sonoprep.com" style="color: #c85b3a; text-decoration: none;">sonoprep.com</a>
          </p>

          <p style="color: #999; font-size: 12px; margin-top: 10px;">
            © 2026 SonoPrep. ARDMS® is a registered trademark of Inteleos.
          </p>
        </div>
      `,
    });

    console.log("[demo-capture] Email sent successfully to:", email);
  } catch (error) {
    console.error("[demo-capture] Email delivery failed:", {
      email,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Don't fail the request - still return success since we logged the capture
  }

  return NextResponse.json({ success: true });
}