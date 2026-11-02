import type { Metadata } from "next";
import EditorialArticle, { EditorialTable, Internal, type FAQ } from "@/components/EditorialArticle";
import { absoluteUrl } from "@/lib/site-config";

const slug = "is-sonoprep-worth-it-2026";
const title = "Is SonoPrep Worth It? An Honest 2026 Buyer's Guide";
const description = "SonoPrep review from the company itself: exact prices, 155-question bank limits, 10-day refund rules, free demo and who should skip it.";
export const metadata: Metadata = { title: { absolute: 'SonoPrep Review 2026: Is It Worth It? | SonoPrep' }, description, alternates: { canonical: absoluteUrl(`/blog/${slug}`) }, openGraph: { title, description, url: absoluteUrl(`/blog/${slug}`), type: "article" } };
const faqs: FAQ[] = [
  { question: "Is SonoPrep affiliated with ARDMS?", answer: "No. SonoPrep is independent of ARDMS and Inteleos. Its practice questions are not official exam questions." },
  { question: "Does SonoPrep have a verified pass rate?", answer: "No. SonoPrep does not currently publish a verified student pass rate, and no practice percentage can predict an official exam score." },
  { question: "Are the three SonoPrep exam attempts three different question banks?", answer: "No. Each 110-question attempt draws from the same 155-question bank, so questions may repeat across attempts." },
  { question: "How long does SonoPrep access last?", answer: "Individual products provide 30 days of access; the $99 bundle provides 45 days. Access starts at purchase and does not renew automatically." },
  { question: "Can I get a refund if SonoPrep is not for me?", answer: "SonoPrep offers a 10-day money-back refund. Request it within 10 days of purchase and check the Terms for eligibility, including limitations for repeat purchases." },
  { question: "Can I try SonoPrep without signing up?", answer: "Yes. The free 10-question practice experience requires no signup. It includes explanations, but its small, single-topic sample cannot assess readiness across all five SPI domains." },
];

export default function Page() {
  return <EditorialArticle slug={slug} title={title} description={description} label="Product transparency" faqs={faqs}
    answer={<p>SonoPrep may be worth <strong>$99</strong> if you want self-paced digital practice and review for the <strong>5-domain</strong> SPI exam: a <strong>110-question</strong> timed simulator, notes and recall tools. It is <em>not</em> an official ARDMS course or a live class. ARDMS lists the exam at <strong>$275</strong> with <strong>555</strong> as the passing scaled score; SonoPrep does not guarantee either outcome.</p>}
    takeaways={[
      "This is a company-authored buyer's guide, not an independent customer review.",
      "The 155-question simulator bank supplies three 110-question attempts; repeats are possible.",
      "The $99 bundle lasts 45 days. Each standalone product lasts 30 days.",
      "There is a 10-day refund policy, with eligibility rules in the Terms.",
      "If you need tutoring, a print book or a verified pass-rate claim, look elsewhere.",
    ]}>
    <p><strong>Full disclosure:</strong> SonoPrep wrote this page about its own products. We cannot provide an independent review, a star rating, or a representative student pass rate. The goal is to tell you precisely what you are buying, including the parts a sales page might leave out. Use the <Internal href="/blog/best-spi-study-materials-2026">SPI study-materials checklist</Internal> to compare any provider on the same criteria.</p>
    <h2>What is inside each SonoPrep product?</h2>
    <p>All four products are browser-based and sold as one-time purchases. They are mapped to the published SPI content outline. They do not include a live instructor or a physical textbook. You can buy one component or get all four in the bundle.</p>
    <EditorialTable headers={["Product", "Price", "Access", "Best for / important limit"]} rows={[
      ["Physics Pearls", "$9", "30 days", "50 concise refreshers; not a complete first course"],
      ["Flashcards", "$24", "30 days", "200 SM-2-style recall cards; not exam-length practice"],
      ["Study Notes", "$34", "30 days", "159 pages across 15 sections; reading alone is not practice"],
      ["Exam Simulator", "$49.99", "30 days", "Three 110-question, two-hour attempts from a 155-question bank; questions can repeat"],
      ["Premium Bundle", "$99", "45 days", "All four; save $17.99 compared with buying individually"],
    ]} />
    <p>The simulator shows explanations and domain-level results. The free <Internal href="/free-spi-practice-test">10-question test</Internal> is a separate sample; it is not a preview of 10 of the 155 paid questions. Because all ten demo items share one broad topic label, it does <strong>not</strong> tell you which of the official five domains is weak. If you would rather sample the interface and flashcards, use the <Internal href="/demo">free demo</Internal> without signing up.</p>
    <h2>What are SonoPrep's strongest and weakest points?</h2>
    <EditorialTable headers={["What works for some candidates", "What may be a deal-breaker"]} rows={[
      ["One place for notes, recall and timed practice", "Digital-only; no live teacher to answer individual questions"],
      ["Per-domain reports after paid attempts", "Small bank relative to three full attempts; expect overlap"],
      ["Clearly stated prices and finite access windows", "Access begins at purchase, not the first day you study"],
      ["10-day refund policy", "Refund eligibility has conditions; check the Terms"],
      ["Original exam-style questions with rationales", "Not official ARDMS questions and no verified student pass-rate data"],
    ]} />
    <p>The newest brand is not automatically better than an established course. We have not independently audited competitor banks or review counts. If third-party testimonials or a live instructor are central to your decision, look for those first. For an overview of the actual exam rather than our product, read the <Internal href="/blog/complete-spi-exam-guide">complete SPI guide</Internal>.</p>
    <h2>Who should buy the bundle—and who should not?</h2>
    <p><strong>Consider it</strong> if you can study independently, have roughly four to six weeks, and need a mix of conceptual review, daily recall and timed practice. The published V24.1 outline gives Doppler 34% and image optimization 26%; use the <Internal href="/blog/ardms-exam-blueprint">domain guide</Internal> to decide where to spend your time.</p>
    <p><strong>Skip it for now</strong> if you cannot yet explain the basic wave properties, need individualized tutoring, prefer print, or already own an equivalent question bank and only need a formula refresher. Start with a school resource and the <Internal href="/spi-physics-formula-sheet">free formula sheet</Internal>. If all you need is exam pacing, the standalone simulator costs $49.99—not $99.</p>
    <h2>Does the $99 price make sense compared with a retake?</h2>
    <p>The <Internal href="/blog/ardms-spi-exam-cost-scheduling-retakes">published SPI fee is $275 per attempt</Internal>. A $99 purchase is less expensive than another exam fee, but that arithmetic is <strong>not</strong> evidence that a purchase prevents a retake. A 555 on ARDMS&apos;s 300–700 scale is not a percentage, so do not read a simulator percentage as a predicted official score.</p>
    <p>Access is 45 days for the bundle, 30 days for individual products, starting when you buy. The <Internal href="/terms">10-day refund terms</Internal> matter: if you purchased the same product or bundle previously, the implementation may treat a later purchase as ineligible. Review the terms or contact support before paying if you are unsure.</p>
    <h2>How should you decide without taking our word for it?</h2>
    <ol>
      <li>Run the free sample and read the explanations. Are they written in a way that helps you understand the concept?</li>
      <li>Check your current <Internal href="/blog/spi-study-plan-30-45-days">30- or 45-day schedule</Internal>. Will you use the paid access window?</li>
      <li>Compare the product specs, current checkout price and refund conditions on <Internal href="/products">the products page</Internal>.</li>
      <li>Then decide whether your problem is knowledge, recall or test timing. Buy only what solves that problem.</li>
    </ol>
  </EditorialArticle>;
}
