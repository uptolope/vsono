// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Email via Resend (SERVER-SIDE ONLY)
// All outbound email goes through this module. No email is ever sent
// from a client component or from a route that doesn't import this.
// ═══════════════════════════════════════════════════════════════════

import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Set this to your verified sending domain in Resend.
// Until you verify a custom domain, Resend allows sending from
// onboarding@resend.dev for testing.
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "SonoPrep <noreply@sonoprep.com>";

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "Reset your SonoPrep password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 16px;">Reset your password</h2>
          <p style="color: #555; line-height: 1.6;">
            Someone requested a password reset for your SonoPrep account. If this was you, click the link below. If not, ignore this email — your password won't change.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #c85b3a; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 24px 0; font-weight: 500;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 13px; line-height: 1.5;">
            This link expires in 1 hour. If the button doesn't work, copy and paste this URL into your browser:
          </p>
          <p style="color: #999; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="color: #bbb; font-size: 11px;">SonoPrep · ARDMS SPI Exam Prep</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendEmailVerification(
  to: string,
  verifyUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "Verify your SonoPrep email address",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 16px;">Verify your email</h2>
          <p style="color: #555; line-height: 1.6;">
            Welcome to SonoPrep! Please verify your email address to complete your account setup.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background: #c85b3a; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 24px 0; font-weight: 500;">
            Verify Email
          </a>
          <p style="color: #999; font-size: 13px; line-height: 1.5;">
            This link expires in 24 hours. If the button doesn't work, copy and paste this URL:
          </p>
          <p style="color: #999; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="color: #bbb; font-size: 11px;">SonoPrep · ARDMS SPI Exam Prep</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: "Failed to send email" };
  }
}
