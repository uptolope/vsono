import Link from "next/link";
import { ExamSimulator } from "@/components/app/exam-simulator";
import { DEMO_QUESTIONS } from "@/lib/demo/exam-data";

export default function FreeSpiPracticeTestPage() {
  const quizSchema = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "Free ARDMS SPI Practice Test",
    description:
      "A free 10-question ultrasound physics practice test for students preparing for the ARDMS Sonography Principles and Instrumentation examination.",
    educationalLevel: "Professional Certification",
    about: {
      "@type": "Thing",
      name: "Ultrasound physics and sonography principles",
    },
    hasPart: DEMO_QUESTIONS.map((question) => ({
      "@type": "Question",
      name: question.question,
      text: question.question,
      answerCount: question.options.length,
      acceptedAnswer: {
        "@type": "Answer",
        text: question.options[question.correctAnswer],
      },
    })),
  };

  return (
    <main className="min-h-screen pt-24 px-6 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(quizSchema),
        }}
      />

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
              FREE SPI PRACTICE TEST
            </p>

            <p className="body-readable text-[#c2bab0] text-sm leading-relaxed">
              Practice core ultrasound physics concepts with the same interactive
              question experience used in the SonoPrep demo. You will receive
              immediate answer feedback, explanations, and a domain breakdown
              when you finish.
            </p>
          </div>
        </div>

        <header className="text-center mb-12">
          <span className="meta">NO SIGNUP REQUIRED</span>

          <h1 className="display-serif text-4xl sm:text-5xl mt-3 font-semibold tracking-tight">
            Free ARDMS SPI Practice Test
          </h1>

          <p className="body-readable text-[#8a8279] mt-4 max-w-2xl mx-auto">
            Test your readiness with 10 board-style questions covering key
            ultrasound physics and instrumentation concepts.
          </p>

          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
            <span className="meta text-[9px] text-[#3a3530]">
              10 QUESTIONS
            </span>

            <span className="text-[#2e2b27]">-</span>

            <span className="meta text-[9px] text-[#3a3530]">
              INSTANT FEEDBACK
            </span>

            <span className="text-[#2e2b27]">-</span>

            <span className="meta text-[9px] text-[#3a3530]">
              DOMAIN BREAKDOWN
            </span>
          </div>
        </header>

        <ExamSimulator questions={DEMO_QUESTIONS} />

        <section className="mt-12 border-t border-white/6 pt-10 text-center">
          <p className="meta text-[9px] text-[#c85b3a] mb-3">
            KEEP BUILDING YOUR SCORE
          </p>

          <h2 className="display-serif text-2xl sm:text-3xl font-semibold text-white">
            Ready for more than 10 questions?
          </h2>

          <p className="body-readable text-[#8a8279] mt-3 max-w-2xl mx-auto">
            The full SonoPrep system adds timed practice exams, expanded
            question coverage, spaced-repetition flashcards, Physics Pearls,
            and study notes for all five ARDMS SPI domains.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mt-6">
            <Link href="/products" className="btn-industrial px-6 py-3">
              VIEW FULL PREP SYSTEM {"->"}
            </Link>

            <Link
              href="/spi-physics-formula-sheet"
              className="btn-industrial-outline px-6 py-3"
            >
              REVIEW FORMULA SHEET {"->"}
            </Link>
          </div>
        </section>

        <section className="mt-12 border-t border-white/6 pt-10">
          <h2 className="display-serif text-2xl font-semibold text-white mb-4">
            How to use this free SPI practice test
          </h2>

          <div className="space-y-4 body-readable text-[#8a8279] text-sm leading-relaxed">
            <p>
              Choose the answer that best matches your understanding of each
              question. After selecting an answer, review the explanation
              before moving to the next question.
            </p>

            <p>
              Use the final domain breakdown as a starting point for your study
              plan. A short practice test is diagnostic, not a prediction of an
              official examination result.
            </p>

            <p>
              These are SonoPrep practice questions and are not official ARDMS
              examination questions.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

