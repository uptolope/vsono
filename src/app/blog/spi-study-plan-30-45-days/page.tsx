import type { Metadata } from "next";
import Link from "next/link";
import BlogPostLayout, { proseClasses } from "@/components/BlogPostLayout";
import BlogCTA from "@/components/marketing/BlogCTA";
import Breadcrumbs from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/site-config";

const PATH = "/blog/spi-study-plan-30-45-days";
const TITLE = "SPI Study Plan: A 30- and 45-Day Schedule Built on the Official Content Outline";
const DESCRIPTION =
  "Two realistic SPI study schedules (30 days and 45 days) that divide your hours by the official ARDMS domain weightings, with a daily routine, practice-exam timing and a last-week checklist.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "SPI study plan",
    "SPI exam study schedule",
    "how long to study for the SPI",
    "30 day SPI study plan",
  ],
  alternates: { canonical: absoluteUrl(PATH) },
};

// Illustrative hour split. Computed directly from the published weights
// (23 / 7 / 26 / 34 / 10) so that it sums to the total.
const DOMAINS = [
  { name: "Domain 4: Apply Doppler Concepts", weight: 34, h30: 20, h45: 31 },
  { name: "Domain 3: Optimize Sonographic Images", weight: 26, h30: 16, h45: 23 },
  { name: "Domain 1: Perform Ultrasound Examinations", weight: 23, h30: 14, h45: 21 },
  { name: "Domain 5: Clinical Safety & Quality Assurance", weight: 10, h30: 6, h45: 9 },
  { name: "Domain 2: Manage Ultrasound Transducers", weight: 7, h30: 4, h45: 6 },
];

export default function Page() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Blog", url: absoluteUrl("/blog") },
          { name: "SPI Study Plan: 30 and 45 Days", url: absoluteUrl(PATH) },
        ]}
      />

      <BlogPostLayout
        tag="STUDY STRATEGY"
        title={TITLE}
        date="September 29, 2026"
        read="12 min read"
        url={absoluteUrl(PATH)}
        description={DESCRIPTION}
      >
        <p>
          Most SPI candidates do not fail for lack of effort. They spread their
          time evenly across topics, when the exam does not. ARDMS publishes
          the content outline with the percentage of the exam each domain
          carries, and the fastest way to improve a study plan is to let those
          percentages decide where the hours go.
        </p>

        <p>
          Below are two schedules: a <strong className="text-white">30-day
          sprint</strong> for candidates who already know the material and need
          to consolidate, and a <strong className="text-white">45-day
          plan</strong> for candidates who are closer to learning it the first
          time. Both use the same structure, and you can stretch or shrink
          either one. If you would rather have a longer, week-by-week version,
          see our{" "}
          <Link href="/blog/pass-spi-first-attempt" className="text-[#c85b3a] hover:text-white">
            6-week blueprint
          </Link>
          .
        </p>

        <h2 className={proseClasses.h2}>What the exam looks like</h2>

        <p>
          According to ARDMS, the SPI exam has approximately 110 multiple-choice
          questions over two hours (including a five-minute survey). It is
          scored pass/fail on a 300–700 scale, and a score of 555 or better
          passes. The score is not a percentage and is not curved. Details
          change, so check the{" "}
          <a
            href="https://www.inteleos.org/exam/sonography-principles-and-instrumentation/"
            className="text-[#c85b3a] hover:text-white"
            rel="noopener"
          >
            official SPI page
          </a>{" "}
          before you commit to a test date. For the rules on fees and retakes,
          see{" "}
          <Link
            href="/blog/ardms-spi-exam-cost-scheduling-retakes"
            className="text-[#c85b3a] hover:text-white"
          >
            SPI exam cost, scoring and retake rules
          </Link>
          .
        </p>

        <h2 className={proseClasses.h2}>Step 1: Split your hours by domain weight</h2>

        <p>
          The current content outline (V24.1) weights the five domains as shown
          below. The hour counts are simple arithmetic on those percentages, for
          a 60-hour plan (30 days at about 2 hours a day) and a 90-hour plan (45
          days at about 2 hours a day). They are a starting point, not a
          prescription.
        </p>

        <table className={proseClasses.table}>
          <thead>
            <tr>
              <th className={proseClasses.th}>Domain</th>
              <th className={proseClasses.th}>Exam weight</th>
              <th className={proseClasses.th}>Hours (30-day, 60 h)</th>
              <th className={proseClasses.th}>Hours (45-day, 90 h)</th>
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((d) => (
              <tr key={d.name}>
                <td className={proseClasses.td}>{d.name}</td>
                <td className={proseClasses.td}>{d.weight}%</td>
                <td className={proseClasses.td}>{d.h30}</td>
                <td className={proseClasses.td}>{d.h45}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>
          Then adjust for your own gaps. If a diagnostic practice test shows you
          are already strong in transducers, move those hours to Doppler. The
          weights tell you where points are available; your results tell you
          where you are losing them. Our{" "}
          <Link href="/blog/ardms-exam-blueprint" className="text-[#c85b3a] hover:text-white">
            blueprint guide
          </Link>{" "}
          explains each domain in detail.
        </p>

        <h2 className={proseClasses.h2}>Step 2: Take a diagnostic before you start</h2>

        <p>
          On day 1, take a short practice set cold. The goal is not a score; it
          is a list of topic areas where you guess. Our free{" "}
          <Link href="/free-spi-practice-test" className="text-[#c85b3a] hover:text-white">
            10-question SPI practice test
          </Link>{" "}
          needs no account and works for this. Write down every topic you
          missed or guessed, and use that list to adjust the hour split above.
        </p>

        <h2 className={proseClasses.h2}>The 45-day schedule</h2>

        <table className={proseClasses.table}>
          <thead>
            <tr>
              <th className={proseClasses.th}>Days</th>
              <th className={proseClasses.th}>Focus</th>
              <th className={proseClasses.th}>What to do</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={proseClasses.td}>1–2</td>
              <td className={proseClasses.td}>Diagnostic and setup</td>
              <td className={proseClasses.td}>
                Diagnostic set, read the official content outline, set your
                exam date, book your daily study slot.
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>3–12</td>
              <td className={proseClasses.td}>Foundations and transducers</td>
              <td className={proseClasses.td}>
                Sound waves, frequency, wavelength, attenuation, impedance,
                pulse-echo principles, transducer construction and beam
                properties. Start flashcards on day 3 and review daily.
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>13–24</td>
              <td className={proseClasses.td}>Image optimization</td>
              <td className={proseClasses.td}>
                Resolution (axial, lateral, elevational, temporal), frame rate
                trade-offs, gain and TGC, harmonics, compounding, display
                modes.
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>25–34</td>
              <td className={proseClasses.td}>Doppler and hemodynamics</td>
              <td className={proseClasses.td}>
                Doppler equation and angle, PRF and the Nyquist limit,
                aliasing fixes, wall filters, spectral, color and power
                Doppler, flow physics. Practice with the{" "}
                <Link href="/tools/nyquist-calculator" className="text-[#c85b3a] hover:text-white">
                  Nyquist calculator
                </Link>
                .
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>35–40</td>
              <td className={proseClasses.td}>Artifacts, safety and QA</td>
              <td className={proseClasses.td}>
                Artifact recognition and fixes, bioeffects and ALARA, QA
                testing and phantoms, patient care and ergonomics.
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>41–44</td>
              <td className={proseClasses.td}>Timed practice and review</td>
              <td className={proseClasses.td}>
                One or two full timed practice exams (two hours). Spend twice as
                long reviewing misses as you spent taking the test.
              </td>
            </tr>
            <tr>
              <td className={proseClasses.td}>45</td>
              <td className={proseClasses.td}>Light review</td>
              <td className={proseClasses.td}>
                Formula sheet and weak-topic flashcards only. Sleep.
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className={proseClasses.h2}>The 30-day sprint</h2>

        <p>
          Compress the same order into four weeks, and assume you have already
          met this material in your program:
        </p>

        <ul className={proseClasses.ul}>
          <li>
            <strong className="text-white">Week 1:</strong> diagnostic, then
            foundations, transducers and pulse-echo principles. Flashcards
            daily from day 2.
          </li>
          <li>
            <strong className="text-white">Week 2:</strong> image optimization
            and display modes. First timed practice block (40–50 questions) at
            the end of the week.
          </li>
          <li>
            <strong className="text-white">Week 3:</strong> Doppler and
            hemodynamics, your largest block of time. Work every aliasing and
            angle problem you can find.
          </li>
          <li>
            <strong className="text-white">Week 4:</strong> artifacts, safety
            and QA for the first three days, then two full timed practice exams
            with full review, then light review the day before.
          </li>
        </ul>

        <h2 className={proseClasses.h2}>A daily routine that works in either plan</h2>

        <ul className={proseClasses.ul}>
          <li>
            <strong className="text-white">15–20 minutes of flashcards first.</strong>{" "}
            Spaced repetition works by returning to material just before you
            would forget it, so daily short reviews beat occasional long ones.
            See{" "}
            <Link href="/blog/spaced-repetition-spi-exam" className="text-[#c85b3a] hover:text-white">
              how spaced repetition works for the SPI
            </Link>
            .
          </li>
          <li>
            <strong className="text-white">45–60 minutes on the day&apos;s topic.</strong>{" "}
            Read, then close the book and explain it aloud or on paper.
          </li>
          <li>
            <strong className="text-white">15–20 minutes of practice questions</strong>{" "}
            on that topic, reviewing every rationale, including the ones you
            got right.
          </li>
          <li>
            <strong className="text-white">Keep an error log.</strong> For each
            miss, write the concept, why you chose the wrong answer, and the
            rule that would have gotten it right. Re-read the log weekly.
          </li>
        </ul>

        <h2 className={proseClasses.h2}>When to sit practice exams</h2>

        <p>
          Sit your first full-length timed exam when you have covered most of
          the material, not before. Two full exams with thorough review is
          usually more useful than five taken without review. A practice score
          cannot predict your real score, so treat it as a tool for finding
          topics to study, not a pass prediction. For pacing strategy on the
          real exam, see our{" "}
          <Link href="/blog/test-taking-strategies-spi" className="text-[#c85b3a] hover:text-white">
            test-taking strategies
          </Link>
          .
        </p>

        <h2 className={proseClasses.h2}>The last-week checklist</h2>

        <ul className={proseClasses.ul}>
          <li>Confirm your appointment, location and accepted ID on the official site.</li>
          <li>
            Re-read your error log and the{" "}
            <Link href="/spi-physics-formula-sheet" className="text-[#c85b3a] hover:text-white">
              formula sheet
            </Link>
            .
          </li>
          <li>Do short, mixed review sets rather than new material.</li>
          <li>Plan the morning: food, travel time, and arriving early.</li>
        </ul>

        <div className={proseClasses.callout}>
          <p className="text-white">
            <strong>Want the practice tools built for this plan?</strong> The{" "}
            <Link href="/spi-flashcards" className="text-[#c85b3a] hover:text-white">
              SPI Flashcards
            </Link>{" "}
            and{" "}
            <Link href="/spi-exam-simulator" className="text-[#c85b3a] hover:text-white">
              Exam Simulator
            </Link>{" "}
            cover the daily review and timed-practice steps above, and the
            Premium Bundle includes both for 45 days.
          </p>
        </div>

        <p className="text-sm text-[#8a8279]">
          Written by the SonoPrep Editorial Team. Exam details come from{" "}
          <a
            href="https://www.inteleos.org/exam/sonography-principles-and-instrumentation/"
            className="text-[#c85b3a] hover:text-white"
            rel="noopener"
          >
            ARDMS / Inteleos
          </a>{" "}
          and the published content outline, checked September 29, 2026.
          SonoPrep is not affiliated with ARDMS and cannot guarantee exam
          results.
        </p>

        <BlogCTA topic="your SPI study plan" />
      </BlogPostLayout>
    </>
  );
}
