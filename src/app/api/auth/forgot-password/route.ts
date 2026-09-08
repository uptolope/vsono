import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const GENERIC_RESPONSE = {
  message: "If an account with that email exists, a reset link has been sent.",
};

function hashResetToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  const ipLimit = await rateLimit(`forgot:ip:${ip}`, {
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });

  if (!ipLimit.allowed) {
    return NextResponse.json(
      GENERIC_RESPONSE,
      { status: 429 },
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 },
    );
  }

  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const email = parsed.data.email;

  const emailLimit = await rateLimit(`forgot:email:${email}`, {
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });

  if (!emailLimit.allowed) {
    return NextResponse.json(
      GENERIC_RESPONSE,
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      deletedAt: true,
    },
  });

  // Always return the same response for existing and nonexistent accounts.
  if (!user || user.deletedAt || !user.email) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const identifier = `pwd-reset:${email}`;
  const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  // Keep only the newest reset token for this email address.
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: tokenHash,
      expires,
    },
  });

  const emailResult = await sendPasswordResetEmail(email, rawToken);

  // If email delivery fails, remove the unusable token.
  if (!emailResult.success) {
    await prisma.verificationToken.deleteMany({
      where: {
        identifier,
        token: tokenHash,
      },
    });

    console.error("Password reset email delivery failed.", {
      emailDomain: email.split("@")[1] ?? "unknown",
    });
  }

  return NextResponse.json(GENERIC_RESPONSE);
}