import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { BCRYPT_COST_FACTOR } from "@/lib/auth";
import { sendEmailVerification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // Rate limit by IP: signup is the entry point for bulk fake-account
  // creation, so this bucket is tighter than login.
  const limit = await rateLimit(`signup:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Deliberately vague — do not reveal whether the email is taken.
    // The real signal (was this created?) is best delivered via the
    // "check your email" flow if you add email verification, not here.
    return NextResponse.json(
      { message: "If this email can be registered, you'll receive further instructions." },
      { status: 200 }
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // Send verification email. Generate a secure random token,
  // store it in VerificationToken with 24-hour expiry, and email the link.
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

  // Fire-and-forget — don't block the response or leak whether
  // the email was actually sent. The user sees the same message
  // regardless.
  sendEmailVerification(email, verifyUrl).catch((err) =>
    console.error("Failed to send verification email:", err)
  );

  return NextResponse.json(
    { message: "If this email can be registered, you'll receive further instructions." },
    { status: 200 }
  );
}
