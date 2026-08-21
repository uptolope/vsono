import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendEmailVerification } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Validate inputs
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token (24-hour expiry)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Create verification token record
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: verificationTokenExpiry,
      },
    });

    // Generate verification URL
    const verifyUrl = `\${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=\${verificationToken}&email=\${encodeURIComponent(email)}`;

    // Send verification email
    const emailResult = await sendEmailVerification(email, verifyUrl);

    if (!emailResult.success) {
      console.warn("⚠️ User created but verification email failed to send:", emailResult.error);
      // Still return success since user was created; they can request email resend later
    }

    return NextResponse.json(
      {
        message: "User created successfully. Check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}