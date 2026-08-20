// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { BCRYPT_COST_FACTOR } from "@/lib/auth";
import { sendEmailVerification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // Rate limit by IP
    const limit = await rateLimit(`signup:\${ip}`, { 
      limit: 5, 
      windowMs: 60 * 60 * 1000 
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Try again later." }, 
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" }, 
        { status: 400 }
      );
    }

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() }, 
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });
    if (existing) {
      return NextResponse.json(
        { message: "If this email can be registered, you'll receive further instructions." },
        { status: 200 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

    // Create user
    await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Build verification URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://\${process.env.VERCEL_URL}` 
      : "https://sonoprep.com";
    const verifyUrl = `\${baseUrl}/verify-email?token=\${verificationToken}&email=\${encodeURIComponent(email)}`;

    // Send verification email — don't block if it fails
    try {
      const emailResult = await sendEmailVerification(email, verifyUrl);
      if (!emailResult.success) {
        console.warn("Verification email failed to send:", emailResult.error);
      }
    } catch (emailErr) {
      console.error("Exception sending verification email:", emailErr);
      // Don't fail signup — user can still log in
    }

    return NextResponse.json(
      { 
        message: "Account created! Check your email to verify your address.",
        success: true 
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "An error occurred during signup. Please try again." },
      { status: 500 }
    );
  }
}
