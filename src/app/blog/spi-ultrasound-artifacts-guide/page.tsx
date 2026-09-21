import type { Metadata } from "next";
import Link from "next/link";
import BlogPostLayout, { proseClasses } from "@/components/BlogPostLayout";

const ARTICLE_URL =
  "https://www.sonoprep.com/blog/spi-ultrasound-artifacts-guide";

export const metadata: Metadata = {
  title: "SPI Exam Ultrasound Artifacts Cheat Sheet: Identification & Fixes",
  description:
    "Identify common ultrasound artifacts for the SPI exam, including reverberation, comet-tail, ring-down, shadowing, enhancement, mirror image, and refraction.",
  keywords: [
    "SPI exam ultrasound artifacts",
    "ultrasound artifacts cheat sheet",
    "reverberation vs comet tail",
    "ring-down artifact",
    "ultrasound physics image artifacts",
  ],
  alternates: {
    canonical: ARTICLE_URL,
  },
};

function BreadcrumbSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.sonoprep.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://www.sonoprep.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "SPI Exam Ultrasound Artifacts Cheat Sheet",
        item: ARTICLE_URL,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the difference between reverberation and comet-tail artifact?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Reverberation usually appears as repeated echoes between strong reflectors, often with equally spaced lines. Comet-tail artifact is a short, tapering reverberation-type artifact behind a small highly reflective interface.",
        },
      },
      {
        "@type": "Question",
        name: "What is ring-down artifact?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Ring-down is a continuous echogenic band commonly associated with resonance involving gas bubbles. It is distinct from ordinary discrete reverberation lines.",
        },
      },
      {
        "@type": "Question",
        name: "What causes posterior acoustic shadowing?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Posterior acoustic shadowing occurs when a structure strongly attenuates or reflects the ultrasound beam, leaving reduced echoes behind the structure.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function SpiUltrasoundArtifactsGuidePage() {
  return (
    <>
      <BreadcrumbSchema />
      <FAQSchema />

      <BlogPostLayout
        tag="IMAGE QUALITY"
        title="SPI Exam Ultrasound Artifacts Cheat Sheet: Identification & Fixes"
        date="September 15, 2026"
        read="12 min read"
        url={ARTICLE_URL}
        description="A practical SPI exam guide to identifying ultrasound artifacts by appearance, physical cause, and corrective strategy."
      >
        <div className={proseClasses.callout}>
          <p className="mb-0 text-sm text-white">
            <strong>Answer capsule:</strong> Ultrasound artifacts are image
            findings that do not accurately represent anatomy because an
            imaging-system assumption has been violated. For the SPI exam,
            identify the visual pattern, name the physical cause, and know the
            adjustment that can reduce it.
          </p>
        </div>

        <p>
          Ultrasound artifacts are a frequent SPI exam topic. Connect the
          visual pattern to a violated assumption: sound travels in a straight
          line, follows a direct path, travels at 1,540 m/s in soft tissue, and
          returns echoes from the expected location.
        </p>

        <h2 className={proseClasses.h2}>
          Reverberation versus comet-tail versus ring-down
        </h2>

        <p>
          <strong className="text-white">Reverberation</strong> occurs when
          sound bounces repeatedly between strong reflectors. It commonly
          appears as multiple, equally spaced parallel echoes that become
          weaker with depth.
        </p>

        <p>
          <strong className="text-white">Comet-tail artifact</strong> is a
          short, bright, tapering reverberation-type artifact behind a small,
          highly reflective interface.
        </p>

        <p>
          <strong className="text-white">Ring-down artifact</strong> is
          different. It is a continuous echogenic band associated with
          resonance involving gas bubbles rather than ordinary discrete
          reverberation lines.
        </p>

        <figure className="my-8 rounded border border-white/[0.08] bg-white/[0.03] p-5">
          <div
            role="img"
            aria-label="Illustration template comparing repeated reverberation lines with a short tapering comet-tail artifact behind a bright reflector"
            className="flex min-h-40 items-center justify-center rounded bg-black/20 p-6 text-center text-sm text-[#8a8279]"
          >
            Figure placeholder: reverberation compared with comet-tail
          </div>
          <figcaption className="mt-3 text-sm text-[#8a8279]">
            Suggested alt text: “Comparison of equally spaced reverberation
            echoes and a short tapering comet-tail artifact behind a bright
            reflector.”
          </figcaption>
        </figure>

        <h2 className={proseClasses.h2}>Common SPI ultrasound artifacts</h2>

        <table className={proseClasses.table}>
          <caption className="mb-3 text-left text-sm text-[#8a8279]">
            Artifact identification and cause reference
          </caption>
          <thead>
            <tr>
              <th scope="col" className={proseClasses.th}>Artifact</th>
              <th scope="col" className={proseClasses.th}>Appearance</th>
              <th scope="col" className={proseClasses.th}>Cause</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={proseClasses.td}>Reverberation</td>
              <td className={proseClasses.td}>
                Repeated equally spaced lines
              </td>
              <td className={proseClasses.td}>
                Multiple reflections between strong reflectors
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Comet-tail</td>
              <td className={proseClasses.td}>
                Bright, short, tapering trail
              </td>
              <td className={proseClasses.td}>
                Closely spaced reverberation behind a small reflector
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Ring-down</td>
              <td className={proseClasses.td}>
                Continuous bright band
              </td>
              <td className={proseClasses.td}>
                Resonance involving gas bubbles
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Shadowing</td>
              <td className={proseClasses.td}>
                Dark region behind a structure
              </td>
              <td className={proseClasses.td}>
                Strong attenuation or reflection
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Enhancement</td>
              <td className={proseClasses.td}>
                Increased brightness behind a structure
              </td>
              <td className={proseClasses.td}>
                Low attenuation through fluid
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Mirror image</td>
              <td className={proseClasses.td}>
                Duplicated anatomy across a strong reflector
              </td>
              <td className={proseClasses.td}>
                An indirect reflected path is interpreted as straight
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Refraction</td>
              <td className={proseClasses.td}>
                Displaced or duplicated anatomy
              </td>
              <td className={proseClasses.td}>
                Beam bending at an oblique interface
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Side-lobe or beam-width</td>
              <td className={proseClasses.td}>
                False echoes inside anechoic structures
              </td>
              <td className={proseClasses.td}>
                Energy from secondary or wider beam paths
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className={proseClasses.h2}>Doppler aliasing as an artifact</h2>

        <p>
          Aliasing occurs in pulsed Doppler when the Doppler frequency shift
          exceeds the Nyquist limit, which is one-half of the pulse repetition
          frequency. The display may show flow in the wrong direction or wrap
          around the velocity scale.
        </p>

        <p>
          Use the{" "}
          <Link
            href="/tools/nyquist-calculator"
            className="text-[#c85b3a] hover:text-white"
          >
            Nyquist limit calculator
          </Link>{" "}
          to connect imaging depth with PRF and the Nyquist limit. Also review
          the{" "}
          <Link
            href="/spi-physics-formula-sheet"
            className="text-[#c85b3a] hover:text-white"
          >
            SPI physics formula sheet
          </Link>{" "}
          and{" "}
          <Link
            href="/spi-ultrasound-glossary"
            className="text-[#c85b3a] hover:text-white"
          >
            ultrasound glossary
          </Link>
          .
        </p>

        <h2 className={proseClasses.h2}>Frequently asked questions</h2>

        <h3 className={proseClasses.h3}>
          What is the difference between reverberation and comet-tail artifact?
        </h3>
        <p>
          Reverberation usually appears as repeated echoes between strong
          reflectors, often with equally spaced lines. Comet-tail artifact is a
          shorter, tapering reverberation-type artifact behind a small,
          highly reflective interface.
        </p>

        <h3 className={proseClasses.h3}>What is ring-down artifact?</h3>
        <p>
          Ring-down is a continuous echogenic band commonly associated with
          resonance involving gas bubbles. It is distinct from ordinary
          discrete reverberation lines.
        </p>

        <h3 className={proseClasses.h3}>
          What causes posterior acoustic shadowing?
        </h3>
        <p>
          Posterior acoustic shadowing occurs when a structure strongly
          attenuates or reflects the ultrasound beam, leaving reduced echoes
          behind the structure.
        </p>
      </BlogPostLayout>
    </>
  );
}
