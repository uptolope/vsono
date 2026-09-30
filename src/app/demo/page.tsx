"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamSimulator } from "@/components/app/exam-simulator";
import { FlashcardViewer } from "@/components/app/flashcard-viewer";
import { DEMO_QUESTIONS } from "@/lib/demo/exam-data";
import { trackLead } from "@/lib/analytics";
import { DEMO_FLASHCARDS } from "@/lib/demo/flashcard-data";

export default function DemoPage() {
  const timeOnPageRef = useRef(0);
  const [showCapture, setShowCapture] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Surface email capture after 25s of engagement
  useEffect(() => {
    const interval = setInterval(() => {
      timeOnPageRef.current += 1;
      if (timeOnPageRef.current >= 25) setShowCapture(true);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/demo/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "demo_page" }),
      });
      if (!res.ok) console.error("Subscribe failed:", res.status);
    } catch {
      /* never block user on marketing call */
    }
    trackLead("demo_page");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-24 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] mb-8 transition-colors"
        >
          ← BACK TO HOME
        </Link>

        {/* What this exam actually is — context for anyone who lands here cold */}
        <div className="mb-8 flex gap-0">
          <div className="w-0.5 bg-[#c85b3a]/40 shrink-0" />
          <div className="pl-4">
            <p className="meta text-[9px] text-[#4a453f] mb-1">
              WHAT YOU'RE PREPARING FOR
            </p>
            <p className="body-readable text-[#c2bab0] text-sm leading-relaxed">
              The ARDMS SPI exam is a prerequisite for every ARDMS credential —
              RDMS, RDCS, RVT, and RMSKS. You cannot register for specialty
              exams until you pass it. ARDMS publishes the exam's five content
              domains and how heavily each is weighted, so targeted prep
              matters.
            </p>
          </div>
        </div>

        {/* Demo header */}
        <div className="text-center mb-12">
          <span className="meta">FREE PREVIEW</span>
          <h1 className="display-serif text-4xl sm:text-5xl mt-3 font-semibold tracking-tight">
            Get a quick snapshot of which practice areas deserve more review after a short practice session.
          </h1>
          <p className="body-readable text-[#8a8279] mt-4 max-w-xl mx-auto">
            This demo uses the same question interface and scoring engine as the full SonoPrep simulator. See exactly
            which of the five study areas aligned to the current published SPI content outline need work. The full version draws 110
            questions from a 155-question bank — every question is tagged by
            topic area, with performance tracking and clear
            explanations for every answer, plus 200 spaced repetition
            flashcards.
          </p>
          {/* Micro-commitment strip */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <span className="meta text-[9px] text-[#3a3530]">
              Takes 2 minutes
            </span>
            <span className="text-[#2e2b27]">·</span>
            <span className="meta text-[9px] text-[#3a3530]">
              No signup required
            </span>
            <span className="text-[#2e2b27]">·</span>
            <span className="meta text-[9px] text-[#3a3530]">
              Instant domain feedback
            </span>
          </div>
        </div>

        {/* Demo */}
        <Tabs defaultValue="exam" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border border-white/10">
            <TabsTrigger
              value="exam"
              className="data-[state=active]:bg-[#c85b3a] data-[state=active]:text-white meta text-[10px]"
            >
              Exam Simulator
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="data-[state=active]:bg-[#c85b3a] data-[state=active]:text-white meta text-[10px]"
            >
              Flashcards
            </TabsTrigger>
          </TabsList>
          <TabsContent value="exam">
            <ExamSimulator questions={DEMO_QUESTIONS} />
          </TabsContent>
          <TabsContent value="flashcards">
            <FlashcardViewer cards={DEMO_FLASHCARDS} />
          </TabsContent>
        </Tabs>

        {/* Email capture — appears after engagement threshold */}
        {showCapture && !submitted && (
          <div className="mt-10 border border-[#c85b3a]/25 bg-[#c85b3a]/[0.04] p-7">
            <p className="display-serif text-xl font-semibold text-white mb-2">
              See your SPI weak spots before exam day.
            </p>
            <p className="body-readable text-[#c2bab0] text-sm mb-6 leading-relaxed">
              Get the free diagnostic link plus a few SPI study tips by email. No
              spam. Unsubscribe any time.
            </p>
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-grow px-4 py-3 bg-[#0B0D10] border border-white/8 text-white placeholder:text-[#3a3530] text-sm focus:outline-none focus:border-[#c85b3a]/40 focus:ring-2 focus:ring-[#c85b3a]/50"
              />
              <button
                type="submit"
                className="btn-industrial px-6 py-3 whitespace-nowrap"
              >
                GET ACCESS →
              </button>
            </form>
            <p className="meta text-[9px] text-[#4a453f] mt-3">
              We&apos;ll email a confirmation link first. Once you confirm,
              you&apos;ll get your diagnostic link and up to 3 follow-up study
              tips over about two weeks. One-click unsubscribe in every email.{" "}
              <Link href="/privacy" className="underline">Privacy Policy</Link>
            </p>
            <p className="meta text-[9px] text-[#3a3530] mt-3">
              Or skip this and{" "}
              <Link
                href="/products"
                className="text-[#4a453f] hover:text-[#c85b3a] transition-colors"
              >
                go straight to products →
              </Link>
            </p>
          </div>
        )}

        {/* Post-submission state */}
        {submitted && (
          <div className="mt-10 border border-white/6 p-7 text-center">
            <p className="display-serif text-lg font-semibold text-white mb-2">
              Check your inbox to confirm.
            </p>
            <p className="body-small text-[#8a8279] text-sm mb-6">
              We&apos;ve sent a confirmation link. Click it and we&apos;ll send
              your free diagnostic link (check spam if you don&apos;t see it).
              When you&apos;re ready for the full prep system:
            </p>
            <Link
              href="/products"
              className="btn-industrial px-6 py-3 inline-block"
            >
              SEE FULL PRICING →
            </Link>
          </div>
        )}

        {/* Always-visible bottom CTA grid */}
        <div className="mt-12 border-t border-white/6 pt-10">
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {/* Bundle push */}
            <div className="depth-border corner-arch p-6 flex flex-col border-[#c85b3a]/20 bg-[#c85b3a]/[0.03]">
              <div className="meta text-[9px] text-[#c85b3a] mb-2">
                RECOMMENDED — BEST VALUE
              </div>
              <h3 className="display-serif text-lg font-semibold text-white mb-2">
                Premium Bundle — $99
              </h3>
              <p className="body-small text-[#c2bab0] text-sm leading-relaxed flex-grow mb-5">
                All four products: 200 flashcards, 110-question exam from a 155-question bank
                bank, 50 Physics Pearls, 159-page notes. 45-day access. 10-day
                refund. Covers all 5 ARDMS SPI domains.
              </p>
              <Link
                href="/products"
                className="btn-industrial py-3 text-center block"
              >
                GET THE BUNDLE →
              </Link>
              <p className="meta text-[9px] text-[#3a3530] text-center mt-2">
                saves $17 vs buying separately
              </p>
            </div>

            {/* Sign in */}
            <div className="depth-border corner-arch p-6 flex flex-col">
              <div className="meta text-[9px] text-[#4a453f] mb-2">
                ALREADY HAVE ACCESS
              </div>
              <h3 className="display-serif text-lg font-semibold text-white mb-2">
                Sign In
              </h3>
              <p className="body-small text-[#8a8279] text-sm leading-relaxed flex-grow mb-5">
                Access your full dashboard, exam history, flashcard progress,
                and domain analytics.
              </p>
              <Link
                href="/login"
                className="btn-industrial-outline py-3 text-center block"
              >
                SIGN IN →
              </Link>
            </div>
          </div>

          {/* Individual entry point */}
          <p className="text-center meta text-[9px] text-[#3a3530]">
            Want to start smaller?{" "}
            <Link
              href="/products"
              className="text-[#4a453f] hover:text-[#c85b3a] transition-colors"
            >
              Physics Pearls from $9 →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

