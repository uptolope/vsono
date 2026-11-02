import type { Metadata } from "next";
import EditorialArticle, { EditorialTable, Internal, type FAQ } from "@/components/EditorialArticle";
import { absoluteUrl } from "@/lib/site-config";

const slug = "four-week-spi-study-plan-2026";
const title = "4-Week SPI Exam Study Plan (2026): A 28-Day Schedule";
const description = "A realistic four-week SPI study schedule with domain-weighted hours, two practice exam days, daily review blocks and a final-week checklist.";
export const metadata: Metadata = { title: { absolute: '4-Week SPI Study Plan 2026 | SonoPrep' }, description, alternates: { canonical: absoluteUrl(`/blog/${slug}`) }, openGraph: { title, description, url: absoluteUrl(`/blog/${slug}`), type: "article" } };
const faqs: FAQ[] = [
  { question: "Is four weeks enough to study for the SPI exam?", answer: "It can be if you have already completed the relevant coursework and can study consistently. If sound-wave basics are new to you or your timed practice shows broad gaps, allow more time or move your exam date if possible." },
  { question: "How many hours a day should I study for the SPI in four weeks?", answer: "This sample plan budgets about 40 hours over 28 days: roughly 90 minutes on most study days plus two longer timed practice sessions and review. Change the total based on your baseline knowledge and commitments." },
  { question: "Which SPI domains should I study most?", answer: "The V24.1 outline assigns 34% to Doppler and 26% to image optimization. Together they represent 60% of the outline. Use that as a starting allocation, then adjust for your actual weaknesses." },
  { question: "When should I take a full SPI practice exam?", answer: "In this example, take one around day 20 after initial coverage and a second around day 27 after fixing weak topics. These are checkpoints for learning, not score thresholds for passing ARDMS." },
  { question: "What practice score means I will pass the real SPI?", answer: "None. ARDMS uses a scaled 300–700 score, with 555 to pass. Third-party percentages cannot be converted to that official score." },
];

export default function Page() {
  return <EditorialArticle slug={slug} title={title} description={description} label="28-day study plan" faqs={faqs}
    answer={<p>With <strong>4 weeks</strong>, budget approximately 40 focused hours and assign about <strong>60%</strong> of domain study to Doppler and image optimization, the two heaviest of the <strong>5 SPI domains</strong>. Reserve days 20 and 27 for timed practice in the approximately <strong>110-question</strong> format. The exam fee is <strong>$275</strong>; passing requires <strong>555</strong> on ARDMS&apos;s scaled score, not a particular practice percentage.</p>}
    takeaways={[
      "This is a compressed review plan for candidates who already have a physics foundation—not a replacement for a sonography program.",
      "Use the official V24.1 weights as your default time budget, then prioritize weak areas shown by practice.",
      "A 90-minute session should mix concept review, original questions and error analysis.",
      "Two full practice days are scheduled; the point is to diagnose and repair, not to chase an invented passing percentage.",
      "If you need a gentler pace, use the existing 30/45-day or six-week plan instead.",
    ]}>
    <p>Four weeks is short. The common mistake is trying to reread every chapter at the same speed. Instead, start with the <Internal href="/blog/ardms-exam-blueprint">ARDMS V24.1 domain weights</Internal> and test whether you can explain the relationship behind each answer. This plan is intentionally different from our <Internal href="/blog/spi-study-plan-30-45-days">longer 30/45-day schedule</Internal>: it assumes you have already learned the fundamentals in school and need a focused review window.</p>
    <h2>How should you divide 40 hours by domain?</h2>
    <p>For a 40-hour example, try twenty 90-minute blocks (30 hours), two two-hour timed attempts (4 hours), and six flexible hours for error-log review and missed concepts. Count 32 hours as content review (the 30 blocks plus two of the flexible hours); the other eight cover the two attempts and four hours of deeper error analysis. This is a planning model, not an ARDMS requirement. If you are weaker in transducers than Doppler, adjust your personal allocation.</p>
    <EditorialTable headers={["Official V24.1 domain", "Weight", "Sample hours out of 32"]} rows={[
      ["Apply Doppler Concepts", "34%", "About 11 hours"],
      ["Optimize Sonographic Images", "26%", "About 8 hours"],
      ["Perform Ultrasound Examinations", "23%", "About 7 hours"],
      ["Clinical Safety & Quality Assurance", "10%", "About 3 hours"],
      ["Manage Ultrasound Transducers", "7%", "About 2 hours"],
    ]} />
    <p>The rounded hours above total about 31, leaving one flexible hour. Domain 4 plus domain 3 is roughly 19 of the 32 hours, or 60%. For the authoritative topic list—not just these rounded numbers—use the <Internal href="/blog/complete-spi-exam-guide">complete SPI guide</Internal> and official outline.</p>
    <h2>What does each week look like?</h2>
    <EditorialTable headers={["Week / days", "Main assignment", "Checkpoint"]} rows={[
      ["1 · days 1–7", "Baseline quiz; wave behavior, propagation, resolution, transducers and image formation. Start a daily error log.", "Explain frequency versus penetration, SPL versus axial resolution, and the purpose of each control without notes."],
      ["2 · days 8–14", "Doppler shift, angle, PRF/Nyquist, color and spectral Doppler; mix with artifacts and optimization.", "Work through aliasing and angle examples; say why each wrong answer fails."],
      ["3 · days 15–21", "Bioeffects, safety and QA; revisit weak areas. Day 20: first full timed practice. Day 21: error analysis.", "Identify weak topics by domain and name the underlying relationship, not the answer letter."],
      ["4 · days 22–28", "Re-teach missed concepts; use spaced recall. Day 27: second full timed practice. Day 28: light review and exam logistics.", "Check pacing, unresolved weak domains and sleep—not a made-up practice-score cutoff."],
    ]} />
    <p>Use the <Internal href="/blog/doppler-principles-spi-exam">Doppler guide</Internal> in week two and the <Internal href="/blog/spi-ultrasound-artifacts-guide">artifact guide</Internal> when the image does not match your initial explanation. For a full six-week alternative, see our <Internal href="/blog/pass-spi-first-attempt">first-attempt blueprint</Internal>.</p>
    <h2>What should you do in a 90-minute study block?</h2>
    <ol>
      <li><strong>25 minutes — one mechanism.</strong> Draw a small diagram or write a three-sentence explanation. Example: raise PRF → raise Nyquist limit → potentially reduce aliasing, subject to depth constraints.</li>
      <li><strong>40 minutes — applied questions.</strong> Mix a few new and old concepts. Write down your reasoning before you reveal the answer. Timed practice helps you notice indecision, but do not rush your first pass through a new idea.</li>
      <li><strong>25 minutes — error repair.</strong> For each miss, record the misconception, the correct relationship and one new example. Schedule another recall attempt tomorrow and a few days later; see the <Internal href="/blog/spaced-repetition-spi-exam">spaced repetition guide</Internal>.</li>
    </ol>
    <p>On a full-practice day, replace that 90-minute block with a two-hour exam and at least another short session to review the explanations. The official exam has approximately 110 questions in two hours, which averages roughly 65 seconds each; review the <Internal href="/blog/test-taking-strategies-spi">pacing strategy</Internal> before your first attempt.</p>
    <h2>How do you use the two practice-exam days?</h2>
    <p>On <strong>day 20</strong>, treat the attempt as a map of gaps. Mark errors in five buckets according to the published outline, and spend days 21–26 fixing concepts rather than repeating the same items. On <strong>day 27</strong>, check whether you can reason under time pressure. Because SonoPrep&apos;s paid simulator draws each 110-question attempt from the same 155-question pool, expect overlap and do not count a familiar answer as new mastery.</p>
    <p>For a small initial sample, the <Internal href="/free-spi-practice-test">free ten-question practice test</Internal> has explanations but only one broad topic label; it cannot diagnose all five domains. If you want longer timed attempts, the <Internal href="/spi-exam-simulator">$49.99 simulator</Internal> includes three attempts and 30-day access. The <Internal href="/products">$99 bundle</Internal> includes it plus 200 flashcards, 50 pearls and 159-page notes for 45 days; both are one-time payments. Start with the <Internal href="/demo">free demo</Internal> to see whether the format suits you.</p>
    <h2>What is the day-before checklist?</h2>
    <ul><li>Confirm your appointment, identification and test-center rules directly with ARDMS and the testing provider.</li><li>Review your small error log and the <Internal href="/spi-physics-formula-sheet">free formula sheet</Internal>; do not reopen an entire textbook.</li><li>Pack what you need, plan travel time and prioritize sleep over a third late-night full exam.</li><li>Remember: a practice percentage does not translate to the official 555 scaled threshold.</li></ul>
  </EditorialArticle>;
}
