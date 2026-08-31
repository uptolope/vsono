import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // Tight rate limit — this endpoint sends email and is an
  // enumeration/spam vector if unbounded.
  const limit = await rateLimit(`forgot:${ip}`, { limit: 3, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    // Return the same 200 message to avoid leaking rate-limit status
    // per email address. The attacker still gets a 429 per IP though.
    return NextResponse.json(
      { message: "If an account with that email exists, a reset link has been sent." },
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

  // Always return the same response whether the email exists or not —
  // do not let the response leak whether this is a valid account.
  const GENERIC_RESPONSE = {
    message: "If an account with that email exists, a reset link has been sent.",
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  // Generate a secure random token and store it in VerificationToken.
  // The "identifier" field uses "pwd-reset:" prefix to distinguish
  // password reset tokens from email verification tokens.
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing reset tokens for this email first
  await prisma.verificationToken.deleteMany({
    where: { identifier: `pwd-reset:${email}` },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: `pwd-reset:${email}`,
      token,
      expires,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://sonoprep.com";
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendPasswordResetEmail(email, resetUrl);

  return NextResponse.json(GENERIC_RESPONSE);
}
