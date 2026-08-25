import { getResendClient } from "@/lib/resend";

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sonoprep.com";
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const emailContent = `
    <h2>Verify Your Email</h2>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>This link expires in 24 hours.</p>
  `;

  try {
    await getResendClient().emails.send({
      from: "noreply@mail.sonoprep.com",
      to: email,
      subject: "Verify Your Email",
      html: emailContent,
    });
    console.log("Verification email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error: String(error) };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sonoprep.com";
  const resetUrl = `${baseUrl}/api/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const emailContent = `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `;

  try {
    await getResendClient().emails.send({
      from: "noreply@mail.sonoprep.com",
      to: email,
      subject: "Reset Your Password",
      html: emailContent,
    });
    console.log("Password reset email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error: String(error) };
  }
}
