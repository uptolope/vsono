import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | SonoPrep",
  description:
    "SonoPrep's terms of service: license terms, refund policy, acceptable use, and limitations of liability.",
  keywords: ["SonoPrep terms of service", "SonoPrep refund policy"],
  alternates: {
    canonical: "https://sonoprep.com/terms",
  },
};

const LAST_UPDATED = "June 1, 2026";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-[#8a8279] text-sm meta">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="space-y-10 text-[#c2bab0] body-readable leading-relaxed">
          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              1. Agreement
            </h2>
            <p>
              By creating an account or purchasing a product on sonoprep.com,
              you agree to these Terms of Service. If you do not agree, do not
              use the service. These terms apply to all users, including free
              demo users and paying subscribers.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              2. License
            </h2>
            <p className="mb-3">
              When you purchase a SonoPrep product, you receive a limited,
              non-exclusive, non-transferable license to access the purchased
              materials for the duration of your access period (30 or 45 days
              depending on plan).
            </p>
            <p>You may not:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Share your account credentials with others</li>
              <li>
                Screenshot, copy, download, or redistribute any exam questions,
                flashcards, or physics pearls
              </li>
              <li>Use the content to build competing products or services</li>
              <li>
                Use automated tools (bots, scrapers) to access the platform
              </li>
            </ul>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              3. Pricing and Payment
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                All prices are in US dollars and include applicable taxes where
                required.
              </li>
              <li>
                Payment is processed by Stripe. We do not store your full card
                details.
              </li>
              <li>Access is granted immediately upon successful payment.</li>
              <li>
                Prices are subject to change. Price changes do not affect
                existing purchases.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              4. Refund Policy
            </h2>
            <p>
              We offer a{" "}
              <strong className="text-white">
                10-day money-back guarantee
              </strong>{" "}
              on all purchases. To request a refund, email{" "}
              <a
                href="mailto:support@sonoprep.com"
                className="text-[#c85b3a] hover:underline"
              >
                support@sonoprep.com
              </a>{" "}
              within 10 days of your purchase date. Refunds are processed within
              5–10 business days to your original payment method. Refund
              requests made after 10 days will not be honored.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              5. Access Period
            </h2>
            <p>
              Access begins on the date of purchase, not on the date you first
              log in. Individual products (Flashcards, Exam Simulator, Physics
              Pearls, Study Notes) include a 30-day access window. The Premium
              Bundle includes 45 days. Access
              expires automatically at the end of the period and is not renewed
              automatically.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              6. Exam Attempts
            </h2>
            <p>
              Products that include the Exam Simulator provide 3 exam attempts
              within the access window. Once an attempt is started, the timer
              cannot be paused or reset. Unused attempts do not carry over after
              the access period ends and are not refundable.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              7. No Guarantee of Exam Results
            </h2>
            <p>
              SonoPrep prepares you for the ARDMS SPI exam based on the
              published content outline, but we cannot guarantee that you will
              pass the exam. Results depend on individual effort, prior
              knowledge, and many factors outside our control. We do not claim
              any specific pass rate.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              8. Intellectual Property
            </h2>
            <p>
              All content on SonoPrep — including exam questions, flashcards,
              physics pearls, study notes, blog articles, UI design, and the
              SonoPrep name and logo — is owned by SonoPrep and protected by
              copyright. Unauthorized reproduction or distribution is prohibited
              and may result in legal action.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              9. Account Termination
            </h2>
            <p>
              We reserve the right to terminate or suspend any account that
              violates these terms, including accounts that share credentials,
              scrape content, or engage in fraudulent activity. Terminated
              accounts for violations are not eligible for refunds.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              10. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, SonoPrep is not liable for
              any indirect, incidental, or consequential damages arising from
              your use of the service. Our total liability to you for any claim
              is limited to the amount you paid for the product in question.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              11. Governing Law
            </h2>
            <p>
              These terms are governed by the laws of the State of Texas, United
              States, without regard to conflict-of-law principles. Any disputes
              will be resolved in the courts of Texas.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              12. Changes to These Terms
            </h2>
            <p>
              We may update these terms. Continued use of the service after
              changes are posted constitutes acceptance. We will update the
              "Last updated" date when changes are made.
            </p>
          </section>

          <section>
            <h2 className="display-serif text-xl font-semibold text-white mb-3">
              13. Contact
            </h2>
            <p>
              Questions about these terms? Email{" "}
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
          <Link href="/privacy" className="hover:text-[#c85b3a]">
            Privacy Policy
          </Link>
          <Link href="/accessibility" className="hover:text-[#c85b3a]">
            Accessibility
          </Link>
        </div>
      </div>
    </div>
  );
}
