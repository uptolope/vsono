import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/verify?token=XXX&email=user@example.com
 * Used when users click the verification link in their email
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    console.log("🔍 GET verify request - Email:", email, "Token (first 16 chars):", token?.substring(0, 16) + "...");

    // Validate inputs
    if (!token || !email) {
      console.error("❌ Missing token or email");
      return NextResponse.json(
        { error: "Missing token or email parameter" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.error("❌ User not found:", normalizedEmail);
      return NextResponse.json(
        { error: "User not found. Please sign up first." },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log("ℹ️  Email already verified for:", normalizedEmail);
      return NextResponse.json(
        { message: "This email is already verified." },
        { status: 200 }
      );
    }

    // Find verification token
    const storedToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token,
      },
    });

    if (!storedToken) {
      console.error("❌ Verification token not found or invalid");
      return NextResponse.json(
        { error: "Invalid or expired verification link." },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (storedToken.expires < new Date()) {
      console.error("❌ Verification token expired for:", normalizedEmail);

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
        {
          error:
            "This verification link has expired. Please sign up again to receive a new link.",
        },
        { status: 400 }
      );
    }

    // Mark email as verified and delete token (atomic transaction)
    console.log("✅ Verifying email and deleting token...");
    await prisma.\$transaction([
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

    console.log("✅ Email verified successfully for:", normalizedEmail);

    return NextResponse.json(
      {
        message: "Email verified successfully! You can now log in.",
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ GET verify error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify
 * Used if frontend needs to verify via POST (backward compatibility)
 * Body: { token: string, email: string }
 */
export async function POST(req: NextRequest) {
  try {
    let body: { token?: string; email?: string };
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error("❌ JSON parse error:", parseErr);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { token, email } = body;

    console.log("🔍 POST verify request - Email:", email, "Token (first 16 chars):", token?.substring(0, 16) + "...");

    // Validate inputs
    if (!token || !email) {
      console.error("❌ Missing token or email in POST body");
      return NextResponse.json(
        { error: "Missing token or email" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.error("❌ User not found:", normalizedEmail);
      return NextResponse.json(
        { error: "User not found. Please sign up first." },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log("ℹ️  Email already verified for:", normalizedEmail);
      return NextResponse.json(
        { message: "This email is already verified." },
        { status: 200 }
      );
    }

    // Find verification token
    const storedToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token,
      },
    });

    if (!storedToken) {
      console.error("❌ Verification token not found or invalid");
      return NextResponse.json(
        { error: "Invalid or expired verification link." },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (storedToken.expires < new Date()) {
      console.error("❌ Verification token expired for:", normalizedEmail);

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
        {
          error:
            "This verification link has expired. Please sign up again to receive a new link.",
        },
        { status: 400 }
      );
    }

    // Mark email as verified and delete token (atomic transaction)
    console.log("✅ Verifying email and deleting token...");
    await prisma.\$transaction([
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

    console.log("✅ Email verified successfully for:", normalizedEmail);

    return NextResponse.json(
      {
        message: "Email verified successfully! You can now log in.",
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ POST verify error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}