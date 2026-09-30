/**
 * Public, client-safe facts about each product, used by the /spi-* landing
 * pages and their Product/Offer structured data.
 *
 * Prices and access windows must stay in sync with:
 *  - src/app/products/page.tsx (displayed prices)
 *  - src/lib/access-durations.ts (access days; imported here, not repeated)
 *  - Stripe price IDs (STRIPE_PRICE_* env vars)
 * scripts/check-invariants.mjs verifies the prices appear on /products.
 *
 * Counts (200 flashcards, 155 questions, 50 pearls, 15 sections) were
 * verified against src/lib/content/* when this file was written.
 */
import { ACCESS_DAYS } from "@/lib/access-durations";

export type CatalogKey =
  | "flashcards"
  | "simulator"
  | "pearls"
  | "notes";

export type CatalogEntry = {
  key: CatalogKey;
  slug: string;
  name: string;
  /** USD, as a string with two decimals for schema.org */
  price: string;
  /** Display price */
  priceLabel: string;
  accessDays: number;
  headline: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  whoFor: string[];
  included: string[];
  howItWorks: string[];
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
};

export const BUNDLE = {
  price: "99.00",
  priceLabel: "$99",
  accessDays: ACCESS_DAYS.PREMIUM_BUNDLE,
  individualTotalLabel: "$116.99",
  savingsLabel: "$17.99",
};

export const REFUND_DAYS = 10;

export const CATALOG: Record<CatalogKey, CatalogEntry> = {
  flashcards: {
    key: "flashcards",
    slug: "spi-flashcards",
    name: "SPI Flashcards",
    price: "24.00",
    priceLabel: "$24",
    accessDays: ACCESS_DAYS.FLASHCARDS,
    headline: "SPI exam flashcards with spaced repetition",
    metaTitle: "SPI Exam Flashcards: 200 Ultrasound Physics Cards",
    metaDescription:
      "200 ultrasound physics flashcards for the ARDMS SPI exam with spaced repetition and per-card progress tracking. $24, 30-day access, 10-day refund.",
    summary:
      "A 200-card deck covering the physics, transducer, Doppler, artifact and safety concepts behind the SPI exam. A spaced-repetition scheduler brings cards you miss back sooner and spaces out the ones you know, so short daily sessions go to your weak spots.",
    whoFor: [
      "Candidates who already have the textbook material and need active recall to make it stick",
      "Working sonographers refreshing physics after time away from the classroom",
      "Anyone who studies in short sessions — commutes, breaks, between clinicals",
    ],
    included: [
      "200 flashcards across five topic areas: Physics Fundamentals (89), Transducer Technology (38), Doppler & Hemodynamics (31), Bioeffects & Safety (29) and Image Artifacts (13)",
      "Spaced-repetition scheduling (an SM-2-style algorithm) that resurfaces missed cards sooner",
      "Per-card progress tracking",
      "Works in any modern browser on phone, tablet or desktop",
    ],
    howItWorks: [
      "Each card shows a question; you think of the answer, reveal it, and mark whether you got it right.",
      "Cards you miss return sooner; cards you get right are scheduled further out.",
      "Your progress is saved to your account so you can switch devices.",
    ],
    faqs: [
      {
        q: "Can I try the flashcards before buying?",
        a: "Yes. The free demo includes 10 sample flashcards written separately from the paid deck, with no account required.",
      },
      {
        q: "How long do I have access?",
        a: "30 days from purchase. It is a one-time payment, not a subscription, and access ends automatically. The Premium Bundle gives 45 days.",
      },
      {
        q: "Is this enough to pass the SPI?",
        a: "Flashcards are built for recall, not for practicing full-length exam timing. Most candidates combine recall with timed practice questions. SonoPrep makes no guarantee of exam results.",
      },
    ],
    related: [
      { href: "/spi-exam-simulator", label: "SPI Exam Simulator" },
      { href: "/blog/spaced-repetition-spi-exam", label: "How spaced repetition works for the SPI" },
      { href: "/spi-physics-formula-sheet", label: "Free SPI physics formula sheet" },
    ],
  },
  simulator: {
    key: "simulator",
    slug: "spi-exam-simulator",
    name: "SPI Exam Simulator",
    price: "49.99",
    priceLabel: "$49.99",
    accessDays: ACCESS_DAYS.EXAM_SIMULATOR,
    headline: "A timed SPI practice exam with rationales and per-domain results",
    metaTitle: "SPI Exam Simulator: Timed 110-Question Practice Exams",
    metaDescription:
      "Timed 110-question SPI practice exams drawn from a 155-question bank, with rationales and per-domain results. 3 attempts, 30-day access, 10-day refund.",
    summary:
      "Practice the pacing of the real exam. Each attempt draws 110 questions from SonoPrep's 155-question bank under a two-hour timer, then shows your results by domain with a rationale for every question, so you can see which topic areas to go back to.",
    whoFor: [
      "Candidates within a few weeks of their exam who need to practice pacing",
      "Anyone who has finished a first pass of the material and wants to find gaps",
      "Retakers who want to identify what to fix before paying another exam fee",
    ],
    included: [
      "3 timed attempts, each with 110 questions drawn at random from a 155-question bank",
      "Two-hour practice timer matching the published SPI format of approximately 110 questions in two hours",
      "A written rationale for each question",
      "Results broken down by domain after each attempt",
    ],
    howItWorks: [
      "Start an attempt; the timer runs and cannot be paused once started.",
      "Answer the questions, then submit to see your score by domain.",
      "Review rationales, study the domains you missed, and use your next attempt to re-test.",
    ],
    faqs: [
      {
        q: "Is the question bank the same as the real exam?",
        a: "No. ARDMS does not publish exam questions, and SonoPrep's questions are its own practice items. The bank has 155 questions and each attempt draws 110 of them at random, so attempts overlap.",
      },
      {
        q: "Does my practice score predict my exam score?",
        a: "No practice test can promise that. Use the per-domain results to decide what to study, not as a pass prediction.",
      },
      {
        q: "Can I try it first?",
        a: "Yes. The free 10-question practice test needs no account, and uses a separate set of sample questions.",
      },
    ],
    related: [
      { href: "/free-spi-practice-test", label: "Free 10-question SPI practice test" },
      { href: "/blog/ardms-exam-blueprint", label: "SPI content outline and domain weightings" },
      { href: "/blog/ardms-spi-exam-cost-scheduling-retakes", label: "SPI exam cost, scoring and retake rules" },
    ],
  },
  pearls: {
    key: "pearls",
    slug: "spi-physics-pearls",
    name: "SPI Physics Pearls",
    price: "9.00",
    priceLabel: "$9",
    accessDays: ACCESS_DAYS.PHYSICS_PEARLS,
    headline: "50 high-yield ultrasound physics pearls for quick review",
    metaTitle: "SPI Physics Pearls: 50 High-Yield Ultrasound Concepts",
    metaDescription:
      "50 concise ultrasound physics summaries for last-minute SPI review: formulas, definitions and clinical relationships. $9, 30-day access, 10-day refund.",
    summary:
      "Fifty short, self-contained summaries of the physics relationships that come up again and again in SPI preparation. They are built for quick review: read one in a minute, or skim all fifty the night before a practice exam.",
    whoFor: [
      "Candidates who want a fast, low-cost review layer on top of a textbook or course",
      "Last-week reviewers who need concise reminders rather than chapters",
      "Anyone who wants to test whether SonoPrep's style suits them before buying more",
    ],
    included: [
      "50 concise concept summaries",
      "Formulas, definitions and clinical relationships in a quick-reference format",
      "Instant digital access in your browser",
    ],
    howItWorks: [
      "Buy once and sign in; the pearls are available immediately.",
      "Read them in order or jump to a concept you keep missing.",
      "Pair them with practice questions to see where the concepts are tested.",
    ],
    faqs: [
      {
        q: "How are Physics Pearls different from the flashcards?",
        a: "Pearls are short explanations you read; flashcards are questions you answer from memory with a spaced-repetition schedule. Many candidates use both.",
      },
      {
        q: "How long do I have access?",
        a: "30 days from purchase, as a one-time payment. The Premium Bundle includes Physics Pearls with 45 days of access.",
      },
      {
        q: "Is there a free sample?",
        a: "The free formula sheet and glossary show the style of reference material SonoPrep writes, and the free demo lets you try the practice and flashcard interface.",
      },
    ],
    related: [
      { href: "/spi-physics-formula-sheet", label: "Free SPI physics formula sheet" },
      { href: "/spi-ultrasound-glossary", label: "Ultrasound physics glossary" },
      { href: "/spi-flashcards", label: "SPI Flashcards" },
    ],
  },
  notes: {
    key: "notes",
    slug: "spi-study-notes",
    name: "SPI Study Notes",
    price: "34.00",
    priceLabel: "$34",
    accessDays: ACCESS_DAYS.STUDY_NOTES,
    headline: "A 15-section SPI study guide for learning the physics, not memorizing it",
    metaTitle: "SPI Study Notes: 15-Section Ultrasound Physics Guide",
    metaDescription:
      "A 15-section ultrasound physics study guide for the ARDMS SPI exam covering Doppler, transducers, artifacts, QA and bioeffects. $34, 30-day access.",
    summary:
      "A structured study guide that walks from sound-wave basics through imaging, transducers, Doppler, artifacts, quality assurance and bioeffects. It is meant for understanding why the physics works, which is what makes application questions easier.",
    whoFor: [
      "Candidates who find the textbook dense and want a structured walk-through",
      "Students who want to understand concepts instead of memorizing answers",
      "Anyone building a study plan who needs an organized first pass",
    ],
    included: [
      "15 sections: Sound Physics Fundamentals; Pulse-Echo Imaging; Transducer Technology; Hemodynamics; Doppler Ultrasound; Display Modes and Imaging; Image Artifacts; Digital Image Processing; Image Enhancement Techniques; Doppler Artifacts and Optimization; Quality Assurance; Bioeffects and Safety; Clinical Application and Patient Care; Diagnostic Testing and Statistics; Additional Key Concepts",
      "Formulas and comparison tables alongside the explanations",
      "Progress tracking as you work through the sections",
    ],
    howItWorks: [
      "Work through the sections in order, or start with the topics you find hardest.",
      "Use the formulas and tables as a quick reference once a section is familiar.",
      "Follow up with flashcards and practice questions to test recall.",
    ],
    faqs: [
      {
        q: "How long do I have access?",
        a: "30 days from purchase, as a one-time payment. The Premium Bundle includes the study notes with 45 days of access.",
      },
      {
        q: "Does this replace my textbook?",
        a: "It is a condensed guide, not a textbook replacement. Standard ultrasound physics textbooks go deeper on derivations and clinical context.",
      },
      {
        q: "Can I print it?",
        a: "Access is through your account and ends when your access window does. Check the terms page for the current license and usage rules.",
      },
    ],
    related: [
      { href: "/blog/spi-study-plan-30-45-days", label: "A 30–45 day SPI study plan" },
      { href: "/spi-physics-formula-sheet", label: "Free SPI physics formula sheet" },
      { href: "/blog/ultrasound-physics-spi", label: "The ultrasound physics concepts that appear on the SPI" },
    ],
  },
};
