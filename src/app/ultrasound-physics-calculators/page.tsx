import type { Metadata } from "next";
import UltrasoundCalculatorsClient from "./UltrasoundCalculatorsClient";

export const metadata: Metadata = {
  title: "Ultrasound Physics Calculators: Axial Resolution & Nyquist",
  description:
    "Free interactive ultrasound physics calculators for axial resolution and the Nyquist limit. Practice important ARDMS SPI exam formulas.",
  keywords: [
    "ultrasound physics calculator",
    "axial resolution calculator",
    "Nyquist limit calculator",
    "ARDMS SPI physics",
  ],
  alternates: {
    canonical: "https://www.sonoprep.com/ultrasound-physics-calculators",
  },
};

function CalculatorSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SonoPrep Ultrasound Physics Calculators",
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    isAccessibleForFree: true,
    description:
      "Interactive calculators for axial resolution and the Nyquist limit used in ultrasound physics and ARDMS SPI exam preparation.",
    url: "https://www.sonoprep.com/ultrasound-physics-calculators",
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

export default function CalculatorsPage() {
  return (
    <>
      <CalculatorSchema />

      <main id="main-content" className="min-h-screen pt-24 px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#c85b3a]">
            ARDMS SPI Study Tools
          </p>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
            Ultrasound Physics Calculators
          </h1>

          <p className="mb-10 text-lg leading-relaxed text-[#c2bab0]">
            Use these free interactive calculators to practice two important
            ultrasound physics formulas: axial resolution and the Nyquist limit.
          </p>
        </div>

        <UltrasoundCalculatorsClient />
      </main>
    </>
  );
}


