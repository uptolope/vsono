import type { Metadata } from "next";
import Link from "next/link";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; done?: string }>;
}) {
  const { e = "", t = "", done } = await searchParams;
  const email = e.trim().toLowerCase();
  const valid = Boolean(email && t && verifyUnsubscribeToken(email, t));

  return (
    <main className="min-h-screen px-6 pt-32 pb-24">
      <div className="mx-auto max-w-md text-center">
        {done ? (
          <>
            <h1 className="display-serif text-3xl font-semibold text-white mb-4">
              You&apos;re unsubscribed
            </h1>
            <p className="body-readable text-sm text-[#8a8279] mb-8">
              We won&apos;t send you any more marketing emails. Account and
              receipt emails are unaffected.
            </p>
            <Link href="/" className="btn-industrial px-6 py-3 text-[10px]">
              BACK TO HOME
            </Link>
          </>
        ) : valid ? (
          <>
            <h1 className="display-serif text-3xl font-semibold text-white mb-4">
              Unsubscribe from SonoPrep emails?
            </h1>
            <p className="body-readable text-sm text-[#8a8279] mb-8">
              This stops study-tip and follow-up emails to {email}.
            </p>
            <form action="/api/unsubscribe" method="post">
              <input type="hidden" name="e" value={email} />
              <input type="hidden" name="t" value={t} />
              <button type="submit" className="btn-industrial px-6 py-3 text-[10px]">
                CONFIRM UNSUBSCRIBE
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="display-serif text-3xl font-semibold text-white mb-4">
              This unsubscribe link isn&apos;t valid
            </h1>
            <p className="body-readable text-sm text-[#8a8279]">
              Use the unsubscribe link from the most recent email we sent you,
              or contact us and we&apos;ll remove you manually.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
