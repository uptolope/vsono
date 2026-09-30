import type { Metadata } from "next";
import Link from "next/link";
import BlogPostLayout, { proseClasses } from "@/components/BlogPostLayout";
import BlogCTA from "@/components/marketing/BlogCTA";
import Breadcrumbs from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/site-config";

const PATH = "/blog/ardms-spi-exam-cost-scheduling-retakes";
const TITLE = "ARDMS SPI Exam Cost, Format, Scoring and Retake Rules (2026)";
const DESCRIPTION =
  "What the SPI exam costs, how it is scored (300–700, 555 to pass), how retakes work, and ARDMS's published pass rates for 2013–2023, all taken from official ARDMS / Inteleos pages.";
const OFFICIAL =
  "https://www.inteleos.org/exam/sonography-principles-and-instrumentation/";

// Source: ARDMS / Inteleos SPI exam page, "SPI Pass Rates for Prior
// Administrations" (checked 2026-09-29). Do not edit without re-checking.
const PASS_RATES = [
  { year: 2023, first: 72, overall: 65 },
  { year: 2022, first: 70, overall: 63 },
  { year: 2021, first: 68, overall: 60 },
  { year: 2020, first: 76, overall: 68 },
  { year: 2019, first: 73, overall: 65 },
  { year: 2018, first: 73, overall: 65 },
  { year: 2017, first: 75, overall: 67 },
  { year: 2016, first: 78, overall: 70 },
  { year: 2015, first: 83, overall: 72 },
  { year: 2014, first: 79, overall: 71 },
  { year: 2013, first: 81, overall: 72 },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "SPI exam cost",
    "SPI exam fee",
    "SPI exam retake policy",
    "SPI passing score 555",
    "SPI pass rate",
  ],
  alternates: { canonical: absoluteUrl(PATH) },
};

function Official({ children }: { children: React.ReactNode }) {
  return (
    <a href={OFFICIAL} className="text-[#c85b3a] hover:text-white" rel="noopener">
      {children}
    </a>
  );
}

export default function Page() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Blog", url: absoluteUrl("/blog") },
          { name: "SPI Exam Cost, Scoring and Retakes", url: absoluteUrl(PATH) },
        ]}
      />

      <BlogPostLayout
        tag="EXAM FACTS"
        title={TITLE}
        date="September 29, 2026"
        read="8 min read"
        url={absoluteUrl(PATH)}
        description={DESCRIPTION}
      >
        <p>
          Before you book the SPI, it helps to know exactly what it costs, how
          it is scored and what happens if you need a second attempt. This
          page collects those facts in one place, taken from the official{" "}
          <Official>ARDMS / Inteleos SPI exam page</Official>, which we checked
          on September 29, 2026. Fees and policies can change, so confirm them
          there before you pay.
        </p>

        <h2 className={proseClasses.h2}>SPI exam facts at a glance</h2>

        <table className={proseClasses.table}>
          <thead>
            <tr>
              <th className={proseClasses.th}>Item</th>
              <th className={proseClasses.th}>What ARDMS publishes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={proseClasses.td}>Exam fee</td>
              <td className={proseClasses.td}>$275 USD</td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Application and exam window</td>
              <td className={proseClasses.td}>Year-round</td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Length and format</td>
              <td className={proseClasses.td}>
                Approximately 110 multiple-choice questions over two hours,
                plus a five-minute survey
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Scoring</td>
              <td className={proseClasses.td}>
                Pass/fail, on a 300–700 point scale. 555 or better passes; not
                percentage- or curve-based
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Score report</td>
              <td className={proseClasses.td}>
                At the test center after you finish, and in your Pearson
                account. Results post to your Inteleos portal within one week
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>If you do not pass</td>
              <td className={proseClasses.td}>
                You can reapply after three days, but must wait 60 days before
                retaking
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>Who must take it</td>
              <td className={proseClasses.td}>
                Everyone pursuing an ARDMS credential (RDMS, RDCS, RVT, RMSKS)
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className={proseClasses.h2}>How much does the SPI cost?</h2>

        <p>
          ARDMS lists the SPI exam fee at <strong className="text-white">$275
          USD</strong>. That is the cost of one attempt; it does not include
          study materials, your program, or any specialty exam you take
          afterward. Retaking means reapplying, so budget for a second fee: if
          the fee is unchanged, two attempts would cost $550. Check the
          current{" "}
          <Official>ARDMS fee schedule</Official> for the exact retake amount.
        </p>

        <p>
          This is the practical argument for preparing carefully the first
          time: the fee is the same whether you pass or not, and a failed
          attempt also costs you at least 60 days before you can retake.
        </p>

        <h2 className={proseClasses.h2}>How the SPI is scored</h2>

        <p>
          Scores are reported on a 300 to 700 scale, and 555 or better passes.
          ARDMS states the score is not a percentage and not curve-based. That
          matters for studying: you cannot convert the score into a number of
          questions you can miss, and a practice test percentage does not map
          directly onto the real scale. Treat practice scores as a guide for
          what to study, not as a prediction.
        </p>

        <h2 className={proseClasses.h2}>The retake rules</h2>

        <ul className={proseClasses.ul}>
          <li>You can reapply three days after an unsuccessful attempt.</li>
          <li>You must wait 60 days between attempts before retaking.</li>
          <li>
            Use the waiting period on your weakest domains. Your score report
            shows how you did, and the{" "}
            <Link href="/blog/ardms-exam-blueprint" className="text-[#c85b3a] hover:text-white">
              domain weightings
            </Link>{" "}
            tell you where the points are. A{" "}
            <Link href="/blog/spi-study-plan-30-45-days" className="text-[#c85b3a] hover:text-white">
              30- or 45-day plan
            </Link>{" "}
            fits inside the 60-day wait.
          </li>
        </ul>

        <h2 className={proseClasses.h2}>The five-year rule</h2>

        <p>
          The SPI is required for every ARDMS certification track. To earn
          RDMS, RDCS, RVT or RMSKS, you must pass the SPI and the corresponding
          specialty exam within five years of each other, in either order.
          After you have passed the SPI once, you do not need to retake it for
          additional ARDMS certifications as long as you keep your status
          active. See our{" "}
          <Link href="/blog/ardms-specialties-comparison" className="text-[#c85b3a] hover:text-white">
            comparison of the four specialties
          </Link>{" "}
          for choosing a track.
        </p>

        <h2 className={proseClasses.h2}>SPI pass rates, 2013–2023</h2>

        <p>
          ARDMS publishes pass rates for prior administrations. The table below
          reproduces the published figures exactly. &quot;First-time&quot;
          means candidates taking the exam for the first time; &quot;overall&quot;
          includes repeat candidates.
        </p>

        <table className={proseClasses.table}>
          <thead>
            <tr>
              <th className={proseClasses.th}>Year</th>
              <th className={proseClasses.th}>First-time takers</th>
              <th className={proseClasses.th}>Overall</th>
            </tr>
          </thead>
          <tbody>
            {PASS_RATES.map((r) => (
              <tr key={r.year}>
                <td className={proseClasses.td}>{r.year}</td>
                <td className={proseClasses.td}>{r.first}%</td>
                <td className={proseClasses.td}>{r.overall}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>
          Source: <Official>ARDMS / Inteleos SPI exam page</Official>. Three
          things stand out. First-time pass rates ranged from 68% (2021) to 83%
          (2015) over this period. In 2023, 72% of first-time takers passed,
          which means roughly 28% did not. And overall rates run below
          first-time rates every year, since repeat candidates pass less often
          on average.
        </p>

        <p>
          These figures describe all candidates, not SonoPrep users. SonoPrep
          does not publish a pass rate because it has no verified data on one.
        </p>

        <h2 className={proseClasses.h2}>Frequently asked questions</h2>

        <h3 className={proseClasses.h3}>How long should I wait to retake the SPI?</h3>
        <p>
          ARDMS requires 60 days between attempts, although you can reapply
          after three days.
        </p>

        <h3 className={proseClasses.h3}>What score do I need on the SPI?</h3>
        <p>A score of 555 or better on the 300–700 scale passes.</p>

        <h3 className={proseClasses.h3}>Is the SPI exam scored on a curve?</h3>
        <p>ARDMS states that the score is not percentage-based or curve-based.</p>

        <h3 className={proseClasses.h3}>Do I have to retake the SPI to add another credential?</h3>
        <p>
          No. After passing once, you do not need to retake it for additional
          ARDMS certifications as long as you maintain active status.
        </p>

        <div className={proseClasses.callout}>
          <p className="text-white">
            <strong>Planning your preparation?</strong> Start with the{" "}
            <Link href="/free-spi-practice-test" className="text-[#c85b3a] hover:text-white">
              free practice test
            </Link>
            , then see the{" "}
            <Link href="/spi-exam-simulator" className="text-[#c85b3a] hover:text-white">
              timed Exam Simulator
            </Link>{" "}
            when you are ready to practice the real format.
          </p>
        </div>

        <p className="text-sm text-[#8a8279]">
          Written by the SonoPrep Editorial Team from ARDMS / Inteleos
          publications, checked September 29, 2026. SonoPrep is not affiliated
          with ARDMS or Inteleos.
        </p>

        <BlogCTA topic="the SPI exam" />
      </BlogPostLayout>
    </>
  );
}
