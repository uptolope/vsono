import { Resend } from "resend";

// Lazily constructed — NOT instantiated at module load. The Resend SDK
// throws synchronously in its constructor if RESEND_API_KEY is missing,
// and Next.js evaluates every route module (including this one, via
// src/lib/email.ts) during `next build`'s page-data collection phase —
// with no actual request happening and no guarantee the email env var
// is set in that environment. That crashed the entire build. This way,
// the module loads fine with no key present; the clear error only
// surfaces if something actually tries to send an email without one
// configured, which is the correct place for that failure to happen.
let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "[resend] RESEND_API_KEY is not set. Set it in your environment " +
        "before sending email (see .env.example)."
    );
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}