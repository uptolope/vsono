import type { Metadata } from "next";
import NyquistCalculatorClient from "@/app/tools/nyquist-calculator/NyquistCalculatorClient";
import { absoluteUrl } from "@/lib/site-config";

// Embeddable version of /tools/nyquist-calculator. It is framable (see the
// /embed/* rule in next.config.ts), deliberately noindex, and canonicalised to
// the full tool page so the embedding sites pass credit to it.
export const metadata: Metadata = {
  title: "Nyquist Limit Calculator (embed)",
  robots: { index: false, follow: true },
  alternates: { canonical: absoluteUrl("/tools/nyquist-calculator") },
};

export default function NyquistEmbedPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <NyquistCalculatorClient />
        <p className="mt-6 text-center text-xs text-[#8a8279]">
          Free ultrasound physics tools by{" "}
          <a
            href={absoluteUrl("/tools/nyquist-calculator")}
            target="_blank"
            rel="noopener"
            className="text-[#c85b3a] underline hover:text-white"
          >
            SonoPrep
          </a>
        </p>
      </div>
    </main>
  );
}
