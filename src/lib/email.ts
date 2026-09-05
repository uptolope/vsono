import { getResendClient } from "@/lib/resend";
import { getAppUrl } from "@/lib/site-url";

export async function sendVerificationEmail(email: string, token: string) {
  // /api/auth/verify-email supports GET and verifies + responds directly,
  // so linking straight to the API route is correct here (confirmed working).
  const verificationUrl = `${getAppUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

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
  // BUG FIXED: this used to point at /api/auth/reset-password, which is a
  // POST-only JSON endpoint (takes token+email+password in the body) — it
  // has no GET handler, so clicking this link in an email produced a 405,
  // not a working reset form. The actual page a human should land on and
  // fill out is /reset-password, which then POSTs to that API route.
  const resetUrl = `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

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
