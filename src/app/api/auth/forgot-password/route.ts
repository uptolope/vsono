import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const GENERIC_RESPONSE = {
  message: "If an account with that email exists, a reset link has been sent.",
};

function hashResetToken(token: string): string {
  return createHash("sha256")
    .update(token, "utf8")
    .digest("hex");
}

function getEmailDomain(email: string): string {
  return email.split("@")[1] ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  /*
   * Rate-limit requests by IP.
   */
  const ipLimit = await rateLimit(`forgot:ip:${ip}`, {
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });

  if (!ipLimit.allowed) {
    return NextResponse.json(GENERIC_RESPONSE, {
      status: 429,
    });
  }

  /*
   * Parse the request body.
   */
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 },
    );
  }

  /*
   * Validate the email address.
   */
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  /*
   * Normalize the email so lookup, rate limiting, and token identifiers
   * use the same value.
   */
  const email = parsed.data.email.trim().toLowerCase();
  const emailDomain = getEmailDomain(email);

  /*
   * Rate-limit requests by email address.
   */
  const emailLimit = await rateLimit(`forgot:email:${email}`, {
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });

  if (!emailLimit.allowed) {
    return NextResponse.json(GENERIC_RESPONSE, {
      status: 429,
    });
  }

  /*
   * Look up the account without revealing whether it exists.
   */
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt || !user.email) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  /*
   * Generate a new token and timestamp for this request.
   *
   * Date objects are stored by Prisma in UTC. This is correct and
   * works consistently on Vercel.
   */
  const resetRequestedAt = new Date();
  const expires = new Date(
    resetRequestedAt.getTime() + RESET_TOKEN_TTL_MS,
  );

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const identifier = `pwd-reset:${email}`;

  console.log("Password reset token created", {
    emailDomain,
    resetRequestedAt: resetRequestedAt.toISOString(),
    expiresAt: expires.toISOString(),
  });

  /*
   * Keep only the newest reset token for this email address.
   */
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

  /*
   * Send the raw token by email.
   * Only the hash is stored in the database.
   */
  console.log("Sending password reset email", {
    emailDomain,
    startedAt: new Date().toISOString(),
  });

  const emailResult = await sendPasswordResetEmail(email, rawToken);

  console.log("Password reset email function completed", {
    emailDomain,
    completedAt: new Date().toISOString(),
    success: emailResult.success,
  });

  /*
   * Remove the token if the email could not be sent.
   */
  if (!emailResult.success) {
    await prisma.verificationToken.deleteMany({
      where: {
        identifier,
        token: tokenHash,
      },
    });

    console.error("Password reset email delivery failed.", {
      emailDomain,
    });
  }

  /*
   * Always return the same response so account existence is not exposed.
   */
  return NextResponse.json(GENERIC_RESPONSE);
}