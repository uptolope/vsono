import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { BCRYPT_COST_FACTOR } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  const limit = await rateLimit(`reset:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { token, email, password } = parsed.data;

  // Look up the token and verify it's valid and not expired.
  const stored = await prisma.verificationToken.findFirst({
    where: {
      identifier: `pwd-reset:${email}`,
      token,
    },
  });

  if (!stored || stored.expires < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

  // Update password, reset lockout state, and invalidate any existing
  // sessions (force re-login with new password).
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      activeSessionId: null,
    },
  });

  // Delete the used token so it can't be replayed.
  await prisma.verificationToken.deleteMany({
    where: { identifier: `pwd-reset:${email}` },
  });

  return NextResponse.json({ message: "Password has been reset. You can now sign in." });
}
