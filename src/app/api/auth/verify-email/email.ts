import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sonoprep.com";
  const verificationUrl = `\${baseUrl}/api/auth/verify-email?token=\${encodeURIComponent(token)}&email=\${encodeURIComponent(email)}`;

  const emailContent = `
    <h2>Verify Your Email</h2>
    <p>Click the link below to verify your email address:</p>
    <a href="\${verificationUrl}">Verify Email</a>
    <p>This link expires in 24 hours.</p>
  `;

  try {
    await resend.emails.send({
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