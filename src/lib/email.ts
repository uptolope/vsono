import { Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Verified subdomain for sending
const FROM_ADDRESS = "noreply@mail.sonoprep.com";

// Validate environment on startup
if (!process.env.RESEND_API_KEY) {
  console.warn(
    "⚠️  WARNING: RESEND_API_KEY is not set in environment variables. Email sending will fail."
  );
}

export async function sendEmailVerification(
  to: string,
  verifyUrl: string
): Promise<{ success: boolean; error?: string }> {
  // Validate inputs
  if (!to || !to.includes("@")) {
    console.error("❌ Invalid email address:", to);
    return { success: false, error: "Invalid email address" };
  }

  if (!verifyUrl || !verifyUrl.startsWith("http")) {
    console.error("❌ Invalid verification URL:", verifyUrl);
    return { success: false, error: "Invalid verification URL" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    console.log("📧 Attempting to send verification email to:", to);
    console.log("🔗 Verification URL:", verifyUrl);

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: to,
      subject: "Verify your SonoPrep email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 480px;
                margin: 0 auto;
                padding: 40px 20px;
                background-color: #f9f9f9;
              }
              .content {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #1a1a1a;
                margin-bottom: 16px;
                font-size: 24px;
              }
              p {
                color: #555;
                line-height: 1.6;
                margin-bottom: 16px;
              }
              .button {
                display: inline-block;
                background-color: #c85b3a;
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 4px;
                text-decoration: none;
                font-weight: 500;
                margin: 24px 0;
              }
              .button:hover {
                background-color: #b04a2b;
              }
              .footer {
                border-top: 1px solid #eee;
                margin-top: 32px;
                padding-top: 32px;
                color: #999;
                font-size: 12px;
              }
              .url-text {
                color: #999;
                font-size: 12px;
                word-break: break-all;
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2>Verify your email</h2>
                <p>Welcome to SonoPrep! Please verify your email address to complete your account setup and get started with your ARDMS SPI exam preparation.</p>
                <a href="\${verifyUrl}" class="button">Verify Email Address</a>
                <p style="color: #999; font-size: 13px;">
                  This link expires in 24 hours. If the button above doesn't work, copy and paste this URL into your browser:
                </p>
                <p class="url-text">\${verifyUrl}</p>
                <div class="footer">
                  <p>SonoPrep · ARDMS SPI Exam Prep</p>
                  <p>If you didn't create this account, please ignore this email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // CRITICAL: Check for error in resolved response
    if (result.error) {
      console.error("❌ Resend API error:", result.error);
      return {
        success: false,
        error: `Failed to send email: \${result.error.message}`,
      };
    }

    console.log("✅ Verification email sent successfully. Message ID:", result.data?.id);
    return { success: true };
  } catch (err) {
    console.error("❌ Exception while sending verification email:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Email service error: \${errorMessage}` };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  // Validate inputs
  if (!to || !to.includes("@")) {
    console.error("❌ Invalid email address:", to);
    return { success: false, error: "Invalid email address" };
  }

  if (!resetUrl || !resetUrl.startsWith("http")) {
    console.error("❌ Invalid reset URL:", resetUrl);
    return { success: false, error: "Invalid reset URL" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    console.log("📧 Attempting to send password reset email to:", to);

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: to,
      subject: "Reset your SonoPrep password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 480px;
                margin: 0 auto;
                padding: 40px 20px;
                background-color: #f9f9f9;
              }
              .content {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #1a1a1a;
                margin-bottom: 16px;
                font-size: 24px;
              }
              p {
                color: #555;
                line-height: 1.6;
                margin-bottom: 16px;
              }
              .button {
                display: inline-block;
                background-color: #c85b3a;
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 4px;
                text-decoration: none;
                font-weight: 500;
                margin: 24px 0;
              }
              .button:hover {
                background-color: #b04a2b;
              }
              .footer {
                border-top: 1px solid #eee;
                margin-top: 32px;
                padding-top: 32px;
                color: #999;
                font-size: 12px;
              }
              .url-text {
                color: #999;
                font-size: 12px;
                word-break: break-all;
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2>Reset your password</h2>
                <p>Someone requested a password reset for your SonoPrep account. If this was you, click the button below to reset your password. If you didn't request this, you can safely ignore this email — your password won't change.</p>
                <a href="\${resetUrl}" class="button">Reset Password</a>
                <p style="color: #999; font-size: 13px;">
                  This link expires in 1 hour. If the button above doesn't work, copy and paste this URL:
                </p>
                <p class="url-text">\${resetUrl}</p>
                <div class="footer">
                  <p>SonoPrep · ARDMS SPI Exam Prep</p>
                  <p>For security reasons, never share this link with anyone.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // CRITICAL: Check for error in resolved response
    if (result.error) {
      console.error("❌ Resend API error:", result.error);
      return {
        success: false,
        error: `Failed to send email: \${result.error.message}`,
      };
    }

    console.log("✅ Password reset email sent successfully. Message ID:", result.data?.id);
    return { success: true };
  } catch (err) {
    console.error("❌ Exception while sending password reset email:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Email service error: \${errorMessage}` };
  }
}
