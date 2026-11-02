import type { Metadata } from "next";
import EditorialArticle, { EditorialTable, Internal, type FAQ } from "@/components/EditorialArticle";
import { absoluteUrl } from "@/lib/site-config";

const slug = "what-happens-if-you-fail-spi-2026";
const title = "What Happens If You Fail the SPI Exam? A 2026 Retake Plan";
const description = "Failed the ARDMS SPI? Understand the 60-day wait, likely $275 retake fee, score report and a practical weak-domain retake plan.";
export const metadata: Metadata = { title: { absolute: 'Failed the SPI Exam? 2026 Retake Plan | SonoPrep' }, description, alternates: { canonical: absoluteUrl(`/blog/${slug}`) }, openGraph: { title, description, url: absoluteUrl(`/blog/${slug}`), type: "article" } };
const faqs: FAQ[] = [
  { question: "How soon can I retake the SPI exam after failing?", answer: "ARDMS says you can reapply after three days but must wait 60 days between exam attempts. Verify the current policy with ARDMS before scheduling." },
  { question: "Do I have to pay again to retake the SPI?", answer: "A retake requires a new application and exam fee. The published SPI fee is $275 per attempt as of the cited ARDMS page; confirm the fee at registration." },
  { question: "Does failing the SPI stop me from pursuing RDMS?", answer: "You need a passing SPI and an appropriate specialty examination within ARDMS's credentialing rules. A failed SPI does not permanently end that path; check your eligibility and timing directly with ARDMS." },
  { question: "Is a practice score of 555 enough to know I am ready?", answer: "A practice percentage cannot be compared with 555. ARDMS uses a scaled 300–700 score and does not publish a conversion from any third-party test. Use practice results to find topics to review." },
  { question: "What should I study between SPI attempts?", answer: "Start with the official score report and content outline. Explain each weak concept, practice new questions, then complete a timed exam under realistic conditions. Do not simply repeat memorized questions." },
];

export default function Page() {
  return <EditorialArticle slug={slug} title={title} description={description} label="Retake strategy" faqs={faqs}
    answer={<p>If you do not pass the SPI in 2026, ARDMS says you can reapply after <strong>3 days</strong>, but you must wait <strong>60 days</strong> between attempts. Budget another <strong>$275</strong> exam fee if the published fee remains unchanged. Review your score report, target weak areas in the <strong>5-domain</strong> outline, and practice the approximately <strong>110-question</strong> format; <strong>555</strong> is the passing scaled score, not a practice-test percentage.</p>}
    takeaways={[
      "A failed attempt is information about your preparation, not a verdict on your ability to become a sonographer.",
      "Reapplication and eligibility are ARDMS decisions; confirm the current policy before paying.",
      "Two attempts at the currently published $275 fee would total $550 in exam fees alone.",
      "Do not infer a lost wage or a guaranteed credential delay: personal timelines vary.",
      "Review mechanisms and timed performance; do not just memorize the previous practice bank.",
    ]}>
    <p>First, take a breath. One unsuccessful attempt can feel expensive and personal. It does not mean your time in school was wasted. The useful next move is to separate the administrative rules from the learning problem and make a plan for each.</p>
    <h2>What are the SPI retake rules?</h2>
    <p>The <a className="text-[#ef9d82] underline" href="https://www.inteleos.org/exam/sonography-principles-and-instrumentation/">official Inteleos SPI exam page</a> is the source for current rules. Our <Internal href="/blog/ardms-spi-exam-cost-scheduling-retakes">exam cost and retake reference</Internal> records the fee, format and scoring details. Policies can change after publication; verify them when you apply.</p>
    <EditorialTable headers={["Item", "Published rule / planning implication"]} rows={[
      ["When to reapply", "ARDMS says reapplication is possible after three days; this is not the same as a new test date."],
      ["Wait between attempts", "At least 60 days."],
      ["Fee", "$275 per attempt as published; check the current fee at checkout."],
      ["Exam format", "About 110 multiple-choice questions in two hours."],
      ["Scoring", "300–700 scaled score; 555 or higher passes. Not a percentage or curve."],
    ]} />
    <h2>What is the real cost of an unsuccessful attempt?</h2>
    <p>It is reasonable to budget for another fee and more study time. It is <em>not</em> reasonable to assign every student the same lost salary: clinical schedules, credential rules and hiring dates vary. Here is the honest accounting.</p>
    <EditorialTable headers={["Cost", "What you can actually know"]} rows={[
      ["First SPI fee", "$275 at the published rate (already paid)."],
      ["Second SPI fee", "Another $275 at that same rate; $550 total in exam fees across two attempts."],
      ["Waiting period", "At least 60 days between attempts, regardless of when you reapply."],
      ["Study time or materials", "Varies by your weak areas, available free resources and whether you choose paid prep."],
      ["Income or credential timing", "Individual and potentially significant, but not quantifiable from an exam fee alone."],
    ]} />
    <h2>How do you read your report without misreading the score?</h2>
    <p>Keep the official report and look for any performance information it gives you. The number 555 is a scaled pass threshold, <strong>not</strong> a target of 55.5% or 555 correct answers. You cannot convert a third-party practice score to the ARDMS scale. Match the areas flagged on your report to the <Internal href="/blog/ardms-exam-blueprint">five-domain V24.1 outline</Internal>: examinations 23%, transducers 7%, image optimization 26%, Doppler 34%, safety and QA 10%. The two largest domains add up to 60% of the outline, but your own report should decide which topics need the most attention.</p>
    <h2>What should your next 60 days look like?</h2>
    <ol>
      <li><strong>Days 1–3: Record the evidence.</strong> Save your score report, list concepts you could not explain, and check ARDMS for reapplication and eligibility rules. Do not immediately rebook based on emotion.</li>
      <li><strong>Weeks 1–2: Repair your weakest mechanisms.</strong> For each missed concept, explain what changes, why it changes and how a scanner control affects it. For aliasing, use the <Internal href="/blog/doppler-principles-spi-exam">Nyquist and Doppler guide</Internal>; for visual problems, use the <Internal href="/blog/spi-ultrasound-artifacts-guide">artifact guide</Internal>.</li>
      <li><strong>Weeks 3–5: Apply the ideas.</strong> Mix topics instead of drilling one familiar bank repeatedly. Use the <Internal href="/blog/spi-study-plan-30-45-days">30/45-day schedule</Internal> to reserve recurring review blocks.</li>
      <li><strong>Final week: Rehearse under time pressure.</strong> About 110 questions in two hours means roughly 65 seconds per question on average. Review errors by domain and revisit the <Internal href="/blog/test-taking-strategies-spi">time-management strategies</Internal>.</li>
    </ol>
    <p>A <Internal href="/free-spi-practice-test">free ten-question sample</Internal> is a place to start, but it is not a five-domain readiness test. If you need longer practice, the <Internal href="/spi-exam-simulator">$49.99 simulator</Internal> offers three timed attempts from a 155-question bank with overlap possible. The <Internal href="/products">$99 bundle</Internal> adds notes, flashcards and pearls for 45 days. Those purchases cannot guarantee a passing score; read the <Internal href="/terms">10-day refund policy</Internal> before paying.</p>
  </EditorialArticle>;
}
