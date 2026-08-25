import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // Tight IP limit for email-sending endpoint
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
  const normalizedEmail = email.trim().toLowerCase();

  // Generic response to prevent email enumeration
  const genericResponse = NextResponse.json({
    message: "If that account needs verification, a new email is on its way.",
  });

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || user.deletedAt || user.emailVerified) {
    return genericResponse;
  }

  // Clear previous tokens
  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  });

  const verificationToken = crypto.randomBytes(32).toString("hex");

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  sendVerificationEmail(normalizedEmail, verificationToken).catch((err) =>
    console.error("Failed to send verification email:", err)
  );

  return genericResponse;
}