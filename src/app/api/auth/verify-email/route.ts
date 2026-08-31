import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function verifyEmail(token: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // Find the verification token
  const storedToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: normalizedEmail,
      token,
    },
  });

  if (!storedToken) {
    return {
      success: false,
      error: "Invalid or expired verification link.",
    };
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
    return {
      success: false,
      error: "This verification link has expired. Please sign up again.",
    };
  }

  // Mark the user's email as verified and delete the used token
  await prisma["$transaction"]([
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

  return { success: true, message: "Email verified successfully." };
}

// Handle GET requests (from email links)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json(
      { error: "Missing token or email" },
      { status: 400 }
    );
  }

  const result = await verifyEmail(token, email);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Redirect to success page
  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}

// Handle POST requests (from API calls)
export async function POST(req: NextRequest) {
  let body: { token?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, email } = body;
  if (!token || !email) {
    return NextResponse.json(
      { error: "Missing token or email" },
      { status: 400 }
    );
  }

  const result = await verifyEmail(token, email);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
