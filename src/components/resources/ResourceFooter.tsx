import Link from "next/link";
import CiteBox from "./CiteBox";
import { SUPPORT_EMAIL, absoluteUrl } from "@/lib/site-config";

type Props = {
  /** Path, e.g. "/spi-physics-formula-sheet" */
  path: string;
  title: string;
  /** ISO date (YYYY-MM-DD) of the last substantive edit. */
  updated: string;
  /** One sentence on how the content was built / what it covers. */
  methodology: string;
  printable?: boolean;
  /** Path of an embeddable version, e.g. "/embed/nyquist-calculator". */
  embedPath?: string;
  /** Extra sources specific to the page. */
  sources?: { label: string; href?: string }[];
};

const BASE_SOURCES: { label: string; href?: string }[] = [
  {
    label:
      "ARDMS / Inteleos — Sonography Principles and Instrumentation (SPI) exam page and content outline",
    href: "https://www.inteleos.org/exam/sonography-principles-and-instrumentation/",
  },
  {
    label:
      "Kremkau, F. W. Sonography Principles and Instruments (Elsevier) — standard ultrasound physics textbook",
  },
  {
    label:
      "Edelman, S. K. Understanding Ultrasound Physics (ESP Ultrasound) — standard ultrasound physics textbook",
  },
];

function formatDate(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Shared trust + citation block for the free reference pages: who publishes
 * it, when it was last updated, how it was built, what it is based on, how to
 * report an error, and a copy-paste citation / link snippet.
 *
 * Reviewer credentials are rendered ONLY when NEXT_PUBLIC_REVIEWER_NAME is
 * configured — never hard-code or guess them.
 */
export default function ResourceFooter({
  path,
  title,
  updated,
  methodology,
  printable,
  embedPath,
  sources = [],
}: Props) {
  const reviewer = process.env.NEXT_PUBLIC_REVIEWER_NAME?.trim();
  const credentials = process.env.NEXT_PUBLIC_REVIEWER_CREDENTIALS?.trim();
  const url = absoluteUrl(path);
  const year = updated.slice(0, 4);
  const allSources = [...sources, ...BASE_SOURCES];

  return (
    <aside className="mx-auto mt-16 max-w-4xl space-y-8 text-sm text-[#8a8279]">
      <CiteBox title={title} url={url} year={year} printable={printable}
        embedUrl={embedPath ? absoluteUrl(embedPath) : undefined}
      />

      <section
        aria-label="About this resource"
        className="no-print space-y-4 rounded border border-white/[0.06] p-6"
      >
        <h2 className="text-lg font-semibold text-white">About this resource</h2>
        <p>
          Published by the SonoPrep Editorial Team. Last updated{" "}
          <time dateTime={updated}>{formatDate(updated)}</time>.
          {reviewer && (
            <>
              {" "}
              Reviewed by {reviewer}
              {credentials ? `, ${credentials}` : ""}.
            </>
          )}
        </p>
        <p>{methodology}</p>
        <p>
          This is educational study material, not clinical guidance. Exam
          rules, fees and content outlines change — always confirm current
          requirements with{" "}
          <a
            href="https://www.inteleos.org/exam/sonography-principles-and-instrumentation/"
            className="text-[#c85b3a] hover:text-white"
            rel="noopener"
          >
            ARDMS / Inteleos
          </a>
          . SonoPrep is an independent study-tools company and is not
          affiliated with or endorsed by ARDMS.
        </p>
        <div>
          <h3 className="mb-2 font-semibold text-white">References</h3>
          <ul className="list-disc space-y-1 pl-5">
            {allSources.map((s) => (
              <li key={s.label}>
                {s.href ? (
                  <a
                    href={s.href}
                    className="text-[#c85b3a] hover:text-white"
                    rel="noopener"
                  >
                    {s.label}
                  </a>
                ) : (
                  s.label
                )}
              </li>
            ))}
          </ul>
        </div>
        <p>
          Spotted an error? Email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
              `Correction: ${title}`,
            )}`}
            className="text-[#c85b3a] hover:text-white"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          and we will review it. See also our{" "}
          <Link href="/privacy" className="text-[#c85b3a] hover:text-white">
            privacy policy
          </Link>
          .
        </p>
      </section>
    </aside>
  );
}
