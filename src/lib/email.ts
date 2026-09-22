import { getResendClient } from "@/lib/resend";
import { getAppUrl } from "@/lib/site-url";

const FROM_ADDRESS = "SonoPrep <noreply@mail.sonoprep.com>";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const verificationUrl =
    `${getAppUrl()}/api/auth/verify-email` +
    `?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const emailContent = `
    <h2>Verify Your Email</h2>
    <p>Click the link below to verify your email address:</p>
    <p>
      <a href="${escapeHtml(verificationUrl)}">Verify Email</a>
    </p>
    <p>This link expires in 24 hours.</p>
  `;

  try {
    await getResendClient().emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Verify Your Email",
      html: emailContent,
    });

    return { success: true };
  } catch {
    console.error("Verification email delivery failed.", {
      emailDomain: email.split("@")[1] ?? "unknown",
    });

    return {
      success: false,
      error: "Email delivery failed.",
    };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const resetUrl =
    `${getAppUrl()}/reset-password` +
    `?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(email)}`;

  const emailContent = `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password:</p>
    <p>
      <a href="${escapeHtml(resetUrl)}">Reset Password</a>
    </p>
    <p>This link expires in 1 hour.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  try {
    await getResendClient().emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Reset Your Password",
      html: emailContent,
    });

    return { success: true };
  } catch {
    console.error("Password reset email delivery failed.", {
      emailDomain: email.split("@")[1] ?? "unknown",
    });

    return {
      success: false,
      error: "Email delivery failed.",
    };
  }
}