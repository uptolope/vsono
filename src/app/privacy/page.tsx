import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | SonoPrep",
  description:
    "SonoPrep's privacy policy: what data we collect, how we use it, and your rights as a user.",
  keywords: ["SonoPrep privacy policy", "sonography exam prep privacy"],
  alternates: {
    canonical: "https://sonoprep.com/privacy",
  },
};

const LAST_UPDATED = "June 1, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="meta text-[11px] text-[#8a8279] hover:text-[#c85b3a] mb-8 inline-block"
        >
          ← BACK TO HOME
        </Link>

        <div className="mb-12">
          <span className="meta text-[#c85b3a] text-sm">LEGAL</span>
          <h1 className="display-display text-4xl sm:text-5xl text-white mt-4 mb-3">
            Privacy Policy
          </h1>
          <p className="text-[#8a8279] text-sm meta">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="space-y-10 text-[#c2bab0] body-readable leading-relaxed">
          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              1. Who We Are
            </h2>
            <p>
              SonoPrep ("we," "us," or "our") is an online exam preparation
              service for ARDMS sonography credentials, operated at
              sonoprep.com. Our support contact is{" "}
              <a
                href="mailto:support@sonoprep.com"
                className="text-[#c85b3a] hover:underline"
              >
                support@sonoprep.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              2. What Data We Collect
            </h2>
            <p className="mb-3">
              We collect only what is necessary to provide the service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Account data:</strong> email
                address and password (hashed) when you register.
              </li>
              <li>
                <strong className="text-white">Payment data:</strong> billing
                name and last 4 digits of card. Full card details are processed
                by Stripe and never stored on our servers.
              </li>
              <li>
                <strong className="text-white">Usage data:</strong> flashcard
                progress, exam scores, and session activity — used to power your
                study dashboard.
              </li>
              <li>
                <strong className="text-white">Analytics data:</strong> page
                views and session duration via Google Analytics (anonymized IP).
                You can opt out via browser extensions that block GA.
              </li>
              <li>
                <strong className="text-white">Support data:</strong> any
                information you send us by email.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              3. How We Use Your Data
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To create and manage your account</li>
              <li>To process payments and send receipts</li>
              <li>To provide and improve the study tools</li>
              <li>
                To send transactional emails (purchase confirmation, password
                reset)
              </li>
              <li>To respond to support requests</li>
            </ul>
            <p className="mt-3">
              We do not sell your data. We do not use your data for advertising.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              4. Third-Party Services
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Stripe</strong> — payment
                processing. Subject to{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c85b3a] hover:underline"
                >
                  Stripe's Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-white">Google Analytics</strong> —
                anonymized site analytics. Subject to{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c85b3a] hover:underline"
                >
                  Google's Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-white">Vercel</strong> — hosting and
                infrastructure. Subject to{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c85b3a] hover:underline"
                >
                  Vercel's Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-white">Neon</strong> — database
                hosting. Data is stored in the US. Subject to{" "}
                <a
                  href="https://neon.tech/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c85b3a] hover:underline"
                >
                  Neon's Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-white">Resend</strong> — transactional
                email delivery (password resets, account notifications).
                Subject to{" "}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c85b3a] hover:underline"
                >
                  Resend's Privacy Policy
                </a>
                .
              </li>
            </ul>
            <p className="mt-3 text-sm">
              Portions of this website and its supporting software were
              developed with the assistance of AI-powered development tools.
              All content, including exam preparation materials, has been
              reviewed and curated by the site owner.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              5. Data Retention
            </h2>
            <p>
              We retain your account data for as long as your account is active.
              If you delete your account, we delete your personal data within 30
              days, except where we are required to retain it by law (e.g.,
              payment records for tax purposes, retained for 7 years).
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              6. Your Rights
            </h2>
            <p className="mb-3">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing</li>
              <li>
                Data portability (receive your data in a machine-readable
                format)
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a
                href="mailto:support@sonoprep.com"
                className="text-[#c85b3a] hover:underline"
              >
                support@sonoprep.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              7. Cookies
            </h2>
            <p>
              We use session cookies to keep you logged in and analytics cookies
              (Google Analytics) to understand site usage. We do not use
              advertising or tracking cookies. You can disable cookies in your
              browser settings, but some features (like staying logged in) will
              not work without them.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              8. Children's Privacy
            </h2>
            <p>
              SonoPrep is intended for adults who are enrolled in or have
              completed accredited sonography programs. We do not knowingly
              collect data from anyone under 18. If you believe a minor has
              created an account, contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this policy. When we do, we will update the "Last
              updated" date at the top of this page. Continued use of the
              service after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              10. Contact
            </h2>
            <p>
              Questions about this policy? Email{" "}
              <a
                href="mailto:support@sonoprep.com"
                className="text-[#c85b3a] hover:underline"
              >
                support@sonoprep.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 flex gap-6 text-sm text-[#8a8279] meta border-t border-white/8 pt-8">
          <Link href="/terms" className="hover:text-[#c85b3a]">
            Terms of Service
          </Link>
          <Link href="/accessibility" className="hover:text-[#c85b3a]">
            Accessibility
          </Link>
        </div>
      </div>
    </div>
  );
}
