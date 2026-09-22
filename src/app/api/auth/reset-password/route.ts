import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { BCRYPT_COST_FACTOR } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function hashResetToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  const limit = await rateLimit(`reset:ip:${ip}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
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

  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { token, email, password } = parsed.data;
  const tokenHash = hashResetToken(token);
  const identifier = `pwd-reset:${email}`;

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

  try {
    await prisma.$transaction(async (tx) => {
      const storedToken = await tx.verificationToken.findFirst({
        where: {
          identifier,
          token: tokenHash,
          expires: {
            gt: new Date(),
          },
        },
      });

      if (!storedToken) {
        throw new Error("INVALID_RESET_TOKEN");
      }

      const user = await tx.user.findUnique({
        where: { email },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      if (!user || user.deletedAt) {
        throw new Error("INVALID_RESET_TOKEN");
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
          activeSessionId: null,
        },
      });

      // Invalidate the used token and any older reset token for this email.
      await tx.verificationToken.deleteMany({
        where: { identifier },
      });
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_RESET_TOKEN"
    ) {
      return NextResponse.json(
        {
          error:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    console.error("Password reset transaction failed.", {
      emailDomain: email.split("@")[1] ?? "unknown",
    });

    return NextResponse.json(
      { error: "Unable to reset your password right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Password has been reset. You can now sign in.",
  });
}