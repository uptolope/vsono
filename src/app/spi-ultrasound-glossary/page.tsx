import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ultrasound Physics Glossary for the ARDMS SPI",
  description:
    "A practical ultrasound physics glossary covering acoustic impedance, axial resolution, duty factor, Nyquist limit, attenuation, cavitation, and more.",
  alternates: {
    canonical: "https://www.sonoprep.com/spi-ultrasound-glossary",
  },
};

const TERMS = [
  {
    term: "Acoustic Impedance",
    definition:
      "The resistance a medium presents to sound transmission. Acoustic impedance is calculated as density multiplied by propagation speed: Z = ρ × c.",
    focus:
      "Impedance differences at tissue boundaries determine the amount of reflected sound.",
  },
  {
    term: "Axial Resolution",
    definition:
      "The ability to distinguish two structures positioned along the path of the sound beam. Axial resolution equals one-half of the spatial pulse length: SPL / 2.",
    focus:
      "Shorter spatial pulse length produces better axial resolution.",
  },
  {
    term: "Lateral Resolution",
    definition:
      "The ability to distinguish two structures positioned side by side, perpendicular to the sound beam.",
    focus:
      "Lateral resolution is best at the beam focus, where beam width is smallest.",
  },
  {
    term: "Duty Factor",
    definition:
      "The fraction of time an ultrasound system is actively transmitting sound. Duty factor equals pulse duration divided by pulse repetition period.",
    focus:
      "Increasing imaging depth increases listening time and generally decreases duty factor.",
  },
  {
    term: "Nyquist Limit",
    definition:
      "The highest Doppler frequency shift that can be measured without aliasing. The Nyquist limit equals one-half of the pulse repetition frequency: PRF / 2.",
    focus:
      "Increase PRF or shift the baseline to help reduce aliasing.",
  },
  {
    term: "Attenuation",
    definition:
      "The weakening of an ultrasound beam as it travels through tissue because of absorption, reflection, scattering, and refraction.",
    focus:
      "Higher frequency sound attenuates more rapidly and has less penetration.",
  },
  {
    term: "Cavitation",
    definition:
      "The interaction of ultrasound with microscopic gas bodies that may expand, contract, or collapse in response to acoustic pressure.",
    focus:
      "Cavitation risk is associated with the Mechanical Index.",
  },
  {
    term: "Snell's Law",
    definition:
      "The relationship that describes how the direction of a sound wave changes when it crosses an interface between media with different propagation speeds.",
    focus:
      "Refraction requires oblique incidence and different propagation speeds.",
  },
];

function GlossarySchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "ARDMS SPI Ultrasound Physics Glossary",
    url: "https://www.sonoprep.com/spi-ultrasound-glossary",
    hasDefinedTerm: TERMS.map((item) => ({
      "@type": "DefinedTerm",
      name: item.term,
      description: item.definition,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function GlossaryPage() {
  return (
    <main className="min-h-screen pt-24 px-6 pb-20">
      <GlossarySchema />

      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] mb-8 transition-colors"
        >
          {"<- BACK TO HOME"}
        </Link>

        <div className="mb-8 flex gap-0">
          <div className="w-0.5 bg-[#c85b3a]/40 shrink-0" />

          <div className="pl-4">
            <p className="meta text-[9px] text-[#4a453f] mb-1">
              ARDMS SPI STUDY REFERENCE
            </p>

            <p className="body-readable text-[#c2bab0] text-sm leading-relaxed">
              Review the ultrasound physics terms that appear repeatedly across
              the ARDMS Sonography Principles and Instrumentation examination.
            </p>
          </div>
        </div>

        <header className="text-center mb-12">
          <span className="meta">PHYSICS GLOSSARY</span>

          <h1 className="display-serif text-4xl sm:text-5xl mt-3 font-semibold tracking-tight text-white">
            Ultrasound Physics Glossary
          </h1>

          <p className="body-readable text-[#8a8279] mt-4 max-w-2xl mx-auto">
            Definitions, equations, and board-focused reminders for the core
            ultrasound physics concepts tested on the ARDMS SPI exam.
          </p>

          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
            <Link
              href="/spi-physics-formula-sheet"
              className="meta text-[9px] text-[#c85b3a] hover:text-[#e06840] transition-colors"
            >
              FORMULA SHEET →
            </Link>

            <span className="text-[#2e2b27]">-</span>

            <Link
              href="/ultrasound-physics-calculators"
              className="meta text-[9px] text-[#c85b3a] hover:text-[#e06840] transition-colors"
            >
              PHYSICS CALCULATORS →
            </Link>
          </div>
        </header>

        <div className="grid gap-5">
          {TERMS.map((item) => (
            <article
              key={item.term}
              className="depth-border corner-arch p-6 bg-white/[0.02]"
            >
              <h2 className="display-serif text-2xl font-semibold text-white mb-3">
                {item.term}
              </h2>

              <p className="body-readable text-[#c2bab0] text-sm leading-relaxed">
                {item.definition}
              </p>

              <div className="mt-5 border-l-2 border-[#c85b3a]/50 pl-4">
                <p className="meta text-[9px] text-[#c85b3a] mb-1">
                  BOARD FOCUS
                </p>
                <p className="body-readable text-[#8a8279] text-sm leading-relaxed">
                  {item.focus}
                </p>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12 border-t border-white/6 pt-10 text-center">
          <p className="meta text-[9px] text-[#c85b3a] mb-3">
            KEEP BUILDING YOUR SCORE
          </p>

          <h2 className="display-serif text-2xl sm:text-3xl font-semibold text-white">
            Turn definitions into exam-ready recall.
          </h2>

          <p className="body-readable text-[#8a8279] mt-3 max-w-2xl mx-auto">
            Use the free practice test to apply these concepts under question
            pressure, then continue with the full SonoPrep preparation system.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mt-6">
            <Link href="/free-spi-practice-test" className="btn-industrial px-6 py-3">
              TAKE FREE PRACTICE TEST →
            </Link>

            <Link
              href="/products"
              className="btn-industrial-outline px-6 py-3"
            >
              VIEW FULL SYSTEM →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
