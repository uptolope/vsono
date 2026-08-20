import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmailVerification } from "@/lib/email";

// Reuses forgotPasswordSchema on purpose — it's just "email, trimmed,
// lowercased" validation, identical shape to what this route needs.
// Not worth a duplicate schema for one field.

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // Same shape as signup/forgot-password: tight IP limit, since this
  // is another email-sending endpoint that could be abused to spam an
  // inbox or burn Resend quota.
  const limit = await rateLimit(`resend-verification:${ip}`, {
    limit: 3,
    windowMs: 15 * 60 * 1000,
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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email } = parsed.data;

  // Same generic response regardless of whether the account exists or
  // is already verified — do not let this endpoint leak either fact.
  const genericResponse = NextResponse.json({
    message: "If that account needs verification, a new email is on its way.",
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt || user.emailVerified) {
    return genericResponse;
  }

  // Clear any previous unexpired tokens for this email so we don't
  // accumulate valid tokens indefinitely across repeated resend clicks.
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "https://sonoprep.com";
  const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

  sendEmailVerification(email, verifyUrl).catch((err) =>
    console.error("Failed to send verification email:", err)
  );

  return genericResponse;
}
