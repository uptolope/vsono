import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ARDMS SPI Ultrasound Physics Formula Sheet (2026)",
  description:
    "Complete SPI ultrasound physics formula cheat sheet. Quick reference guide for Doppler shifts, axial resolution, acoustic impedance, Snell's law, and attenuation.",
  alternates: {
    canonical: "https://sonoprep.com/spi-physics-formula-sheet",
  },
};

const FORMULAS = [
  {
    category: "Pulsed Wave & Resolution",
    items: [
      {
        name: "Axial Resolution",
        formula: "SPL / 2",
        notes:
          "LARRD. Determined by spatial pulse length. Lower value = better resolution.",
      },
      {
        name: "Spatial Pulse Length (SPL)",
        formula: "Number of Cycles × Wavelength (λ)",
        notes: "Determined by both sound source and medium.",
      },
      {
        name: "Pulse Duration (PD)",
        formula: "Number of Cycles × Period (T)",
        notes: "Time from start of a pulse to end of that pulse.",
      },
      {
        name: "Duty Factor (DF)",
        formula: "(Pulse Duration / PRP) × 100",
        notes: "Typical clinical imaging range is 0.1% to 1.0%.",
      },
    ],
  },
  {
    category: "Doppler & Hemodynamics",
    items: [
      {
        name: "Doppler Equation",
        formula: "Fd = (2 × Fo × v × cos θ) / c",
        notes:
          "Maximum Doppler shift occurs at 0° when cos θ equals 1.0.",
      },
      {
        name: "Nyquist Limit",
        formula: "PRF / 2",
        notes: "Threshold above which spectral aliasing occurs.",
      },
      {
        name: "Poiseuille's Law",
        formula: "ΔP = (8 × η × L × Q) / (π × r⁴)",
        notes:
          "A change in radius has an exponential effect on flow resistance.",
      },
    ],
  },
  {
    category: "Wave Properties & Attenuation",
    items: [
      {
        name: "Acoustic Impedance (Z)",
        formula: "Density (ρ) × Propagation Speed (c)",
        notes:
          "Measured in Rayls. Determines boundary reflection magnitude.",
      },
      {
        name: "Attenuation Coefficient",
        formula: "Frequency (MHz) / 2",
        notes: "In soft tissue, approximately 0.5 dB/cm/MHz.",
      },
      {
        name: "Snell's Law",
        formula: "sin(θt) / sin(θi) = c₂ / c₁",
        notes:
          "Refraction requires oblique incidence and different propagation speeds.",
      },
    ],
  },
];

function FormulaSheetSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "ARDMS SPI Ultrasound Physics Formula Sheet",
    description:
      "Comprehensive quick-reference guide to SPI ultrasound physics formulas and equations.",
    url: "https://sonoprep.com/spi-physics-formula-sheet",
    author: {
      "@type": "Organization",
      name: "SonoPrep Clinical Faculty",
      url: "https://sonoprep.com",
    },
    publisher: {
      "@type": "Organization",
      name: "SonoPrep",
      url: "https://sonoprep.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://sonoprep.com/spi-physics-formula-sheet",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function FormulaSheetPage() {
  return (
    <>
      <FormulaSheetSchema />

      <main className="min-h-screen pt-24 px-6 pb-20">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#c85b3a]">
          ARDMS SPI Study Reference
        </p>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
          ARDMS SPI Ultrasound Physics Formula Sheet
        </h1>

        <p className="mb-8 text-lg leading-relaxed text-[#c2bab0]">
          The ultimate equation guide for the ARDMS Sonography Principles &
          Instrumentation examination. Need to test calculations? Check our{" "}
          <Link
            href="/ultrasound-physics-calculators"
            className="text-[#c85b3a] underline hover:text-[#e06840]"
          >
            interactive physics calculators
          </Link>
          .
        </p>

        <div className="space-y-10">
          {FORMULAS.map((section) => (
            <section
              key={section.category}
              className="rounded border border-white/[0.06] bg-white/[0.02] p-6 "
            >
              <h2 className="mb-4 text-2xl font-bold text-white">
                {section.category}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-sm font-semibold text-[#8a8279]">
                      <th className="pb-3 pr-4">Parameter</th>
                      <th className="px-4 pb-3">Formula</th>
                      <th className="pb-3 pl-4">Key Clinical Concept</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.06] text-sm">
                    {section.items.map((item) => (
                      <tr key={item.name}>
                        <td className="py-3 pr-4 font-medium text-white">
                          {item.name}
                        </td>

                        <td className="rounded bg-white/[0.03] px-4 py-3 font-mono font-bold text-[#c85b3a]">
                          {item.formula}
                        </td>

                        <td className="py-3 pl-4 text-[#8a8279]">
                          {item.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}


