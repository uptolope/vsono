import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import NyquistCalculatorClient from "./NyquistCalculatorClient";

export const metadata: Metadata = {
  title: "Nyquist Limit Calculator by Depth | SPI Exam Physics",
  description:
    "Calculate PRF and the Nyquist limit from imaging depth using PRF = 77 ÷ depth in centimeters.",
  keywords: [
    "Nyquist limit calculator",
    "Nyquist calculator by depth",
    "PRF calculator ultrasound",
    "ultrasound aliasing calculator",
    "SPI exam physics calculator",
  ],
  alternates: {
    canonical: "https://www.sonoprep.com/tools/nyquist-calculator",
  },
};

function NyquistSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SonoPrep Nyquist Limit Calculator",
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    isAccessibleForFree: true,
    url: "https://www.sonoprep.com/tools/nyquist-calculator",
    description:
      "Interactive ultrasound physics calculator for estimating PRF and the Nyquist limit from imaging depth.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function NyquistCalculatorPage() {
  return (
    <>
      <NyquistSchema />

      <main className="min-h-screen px-6 pb-20 pt-32">
        <div className="mx-auto max-w-4xl">
          <Breadcrumbs
            items={[
              {
                name: "Home",
                url: "https://www.sonoprep.com/",
              },
              {
                name: "Ultrasound Physics Calculators",
                url: "https://www.sonoprep.com/ultrasound-physics-calculators",
              },
              {
                name: "Nyquist Limit Calculator",
                url: "https://www.sonoprep.com/tools/nyquist-calculator",
              },
            ]}
          />

          <header className="mb-10">
            <p className="mb-3 text-sm uppercase tracking-widest text-[#c85b3a]">
              SPI PHYSICS TOOL
            </p>

            <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Nyquist Limit Calculator by Depth
            </h1>

            <p className="max-w-3xl text-lg leading-relaxed text-[#c2bab0]">
              Calculate pulse repetition frequency and the Nyquist limit from
              imaging depth for ARDMS SPI exam preparation.
            </p>
          </header>

          <NyquistCalculatorClient />

          <section className="mt-12 space-y-6 text-[#c2bab0]">
            <h2 className="text-2xl font-semibold text-white">
              How the formula works
            </h2>

            <p>
              For this exam-style calculation, pulse repetition frequency is
              estimated from imaging depth:
            </p>

            <div className="rounded border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="font-mono text-lg text-white">
                PRF = 77 ÷ depth (cm)
              </p>
              <p className="mt-2 font-mono text-lg text-white">
                Nyquist limit = PRF ÷ 2
              </p>
            </div>

            <p>
              Increasing imaging depth lowers PRF because the system needs more
              time for echoes to return. A lower PRF also lowers the Nyquist
              limit, which can make aliasing more likely.
            </p>

            <div className="rounded border-l-4 border-[#c85b3a] bg-[#c85b3a]/10 p-5">
              <p className="font-semibold text-white">SPI exam takeaway</p>
              <p className="mt-2">
                Aliasing can occur when a Doppler frequency shift exceeds half
                the PRF. Common controls include increasing the PRF or scale,
                lowering transmit frequency, and shifting the baseline.
              </p>
            </div>

            <nav aria-label="Related SPI study resources" className="pt-4">
              <h2 className="mb-3 text-xl font-semibold text-white">
                Continue studying
              </h2>

              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <Link
                    href="/ultrasound-physics-calculators"
                    className="text-[#c85b3a] hover:text-white"
                  >
                    Review all ultrasound physics calculators
                  </Link>
                </li>
                <li>
                  <Link
                    href="/spi-physics-formula-sheet"
                    className="text-[#c85b3a] hover:text-white"
                  >
                    Study the SPI physics formula sheet
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog/ultrasound-physics-spi"
                    className="text-[#c85b3a] hover:text-white"
                  >
                    Read the ultrasound physics SPI guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/exam-simulator"
                    className="text-[#c85b3a] hover:text-white"
                  >
                    Practice with the 110-question Exam Simulator
                  </Link>
                </li>
              </ul>
            </nav>
          </section>
        </div>
      </main>
    </>
  );
}


