export async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `\${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=\${encodeURIComponent(token)}&email=\${encodeURIComponent(email)}`;
  
    const emailContent = `
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="\${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `;
  
    // For now, just log it (replace with actual email service)
    console.log("Verification Email sent to:", email);
    console.log("Verification URL:", verificationUrl);
  }