import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validations";
import { BCRYPT_COST_FACTOR } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // Rate limit signup attempts — prevent spam/brute force
    const limit = await rateLimit(`signup:${ip}`, { 
      limit: 5, 
      windowMs: 15 * 60 * 1000 // 5 attempts per 15 minutes
    });
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate input using schema
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password with OWASP-recommended cost factor (12)
    // CRITICAL FIX: Was using cost 10, now uses BCRYPT_COST_FACTOR constant
    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

    // Generate verification token (24-hour expiry)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // CRITICAL FIX: Changed "password" field to "passwordHash" to match Prisma schema
    // This was preventing login because auth.ts checks for user.passwordHash
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashedPassword,
        name,
      },
    });

    // Create verification token record
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: verificationToken,
        expires: verificationTokenExpiry,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      verificationToken
    );

    if (!emailResult.success) {
      console.warn(
        "⚠ User created but verification email failed to send:",
        emailResult.error
      );
      // Still return success since user was created; they can request email resend later
    }

    return NextResponse.json(
      {
        message:
          "User created successfully. Check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SIGNUP_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown signup error",
      },
      { status: 500 }
    );
  }
}