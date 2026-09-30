import type { Metadata } from "next";
import Link from "next/link";
import ResourceFooter from "@/components/resources/ResourceFooter";

export const metadata: Metadata = {
  title: "ARDMS SPI Ultrasound Physics Formula Sheet (2026)",
  description:
    "Complete SPI ultrasound physics formula cheat sheet. Quick reference guide for Doppler shifts, axial resolution, acoustic impedance, Snell's law, and attenuation.",
  alternates: {
    canonical: "https://www.sonoprep.com/spi-physics-formula-sheet",
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
    category: "Time, Distance & Frame Rate",
    items: [
      {
        name: "Period (T)",
        formula: "1 / Frequency (f)",
        notes: "Period and frequency are reciprocals. Set by the sound source.",
      },
      {
        name: "Wavelength (λ)",
        formula: "Propagation Speed (c) / Frequency (f)",
        notes:
          "In soft tissue (1540 m/s), λ in mm = 1.54 / frequency in MHz.",
      },
      {
        name: "Pulse Repetition Period (PRP)",
        formula: "1 / PRF",
        notes:
          "Time from the start of one pulse to the start of the next, including listening time.",
      },
      {
        name: "Go-Return Time (Time of Flight)",
        formula: "13 µs per cm of depth",
        notes:
          "Rule of thumb for soft tissue: an echo from 1 cm depth returns in about 13 µs.",
      },
      {
        name: "Maximum PRF for a Depth",
        formula: "77,000 / depth (cm)  (Hz)",
        notes:
          "Equivalent to 77 / depth (cm) in kHz. Deeper imaging forces a lower PRF.",
      },
      {
        name: "Frame Rate",
        formula: "PRF / Lines per Frame",
        notes:
          "More lines, deeper depth or multiple focal zones lower the frame rate.",
      },
    ],
  },
  {
    category: "Decibels, Intensity & Reflection",
    items: [
      {
        name: "Intensity",
        formula: "Power / Area",
        notes:
          "Doubling the power doubles the intensity; halving the beam area also doubles it.",
      },
      {
        name: "Decibels (intensity or power)",
        formula: "dB = 10 × log₁₀(I₂ / I₁)",
        notes:
          "+3 dB ≈ ×2, −3 dB ≈ ×½, +10 dB = ×10. For amplitude or pressure the multiplier is 20 × log₁₀.",
      },
      {
        name: "Total Attenuation",
        formula: "Attenuation Coefficient (dB/cm) × Path Length (cm)",
        notes:
          "Path length is the round-trip distance for an echo (2 × depth).",
      },
      {
        name: "Half-Value Layer (HVL)",
        formula: "3 dB / Attenuation Coefficient (dB/cm)",
        notes:
          "Depth at which intensity has fallen by 3 dB. Shallower for higher frequencies.",
      },
      {
        name: "Intensity Reflection Coefficient (IRC)",
        formula: "[(Z₂ − Z₁) / (Z₂ + Z₁)]²",
        notes:
          "Normal incidence. Larger impedance mismatch means more reflection; equal impedances mean none.",
      },
    ],
  },
  {
    category: "Beam Geometry & Hemodynamics",
    items: [
      {
        name: "Near Zone Length (Focal Depth)",
        formula: "D² / (4 × λ)",
        notes:
          "D is the aperture (crystal) diameter. Larger aperture or higher frequency lengthens the near zone.",
      },
      {
        name: "Continuity Equation",
        formula: "A₁ × v₁ = A₂ × v₂",
        notes:
          "Velocity rises at a stenosis because the cross-sectional area falls.",
      },
      {
        name: "Simplified Bernoulli",
        formula: "ΔP = 4 × v²",
        notes: "Pressure gradient in mmHg with velocity in m/s.",
      },
      {
        name: "Reynolds Number",
        formula: "(ρ × v × D) / η",
        notes:
          "Values above roughly 2000 predict turbulent flow; below that flow tends to be laminar.",
      },
      {
        name: "Resistive Index (RI)",
        formula: "(PSV − EDV) / PSV",
        notes: "Uses peak systolic and end-diastolic velocities.",
      },
      {
        name: "Pulsatility Index (PI)",
        formula: "(PSV − EDV) / Mean Velocity",
        notes: "Uses the mean velocity over the cardiac cycle.",
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
    url: "https://www.sonoprep.com/spi-physics-formula-sheet",
    dateModified: "2026-09-29",
    author: {
      "@type": "Organization",
      name: "SonoPrep Editorial Team",
      url: "https://www.sonoprep.com",
    },
    publisher: {
      "@type": "Organization",
      name: "SonoPrep",
      url: "https://www.sonoprep.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.sonoprep.com/spi-physics-formula-sheet",
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

        <ResourceFooter
          path="/spi-physics-formula-sheet"
          title="ARDMS SPI Ultrasound Physics Formula Sheet"
          updated="2026-09-29"
          printable
          methodology="Formulas are the standard relationships taught in ultrasound physics courses, organized by the SPI content outline domains. Typical soft-tissue values use the conventional 1540 m/s propagation speed, and the rules of thumb (13 µs/cm, 77 kHz ÷ depth) follow from it."
        />
      </main>
    </>
  );
}



