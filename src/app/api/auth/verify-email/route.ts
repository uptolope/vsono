import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let body: { token?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, email } = body;
  if (!token || !email) {
    return NextResponse.json({ error: "Missing token or email" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Find the verification token
  const storedToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: normalizedEmail,
      token,
    },
  });

  if (!storedToken) {
    return NextResponse.json(
      { error: "Invalid or expired verification link." },
      { status: 400 }
    );
  }

  if (storedToken.expires < new Date()) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: normalizedEmail,
          token,
        },
      },
    });
    return NextResponse.json(
      { error: "This verification link has expired. Please sign up again." },
      { status: 400 }
    );
  }

  // Mark the user's email as verified and delete the used token
  await prisma.$transaction([
    prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: normalizedEmail,
          token,
        },
      },
    }),
  ]);

  return NextResponse.json({ message: "Email verified successfully." });
}
