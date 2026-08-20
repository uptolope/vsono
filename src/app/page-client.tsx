"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { trackSignup } from "@/lib/analytics";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ExamSimulator } from "@/components/app/exam-simulator";
import { FlashcardViewer } from "@/components/app/flashcard-viewer";
import { DEMO_QUESTIONS } from "@/lib/demo/exam-data";
import { DEMO_FLASHCARDS } from "@/lib/demo/flashcard-data";
import { FaqSection } from "@/components/marketing/faq-section";
import BlurText from "@/components/ui/blur-text";

/* ═══════════════════════════════════════════════════════════════════
   SECTION: Hero — Clean, full-viewport, 1+1 animation
   BlurText headline (React Bits) · Aurora CSS atmosphere
   REMOVED: hero-orb-2, counters animation, particles, floating orbs,
   waveform, magnetic buttons, tilt cards, bouncing scroll hint
═══════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Atmosphere — aurora-inspired CSS (ONE background effect) */}
      <div className="sono-atmosphere" />
      <div className="hero-aurora" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
        {/* Credential gate — staggered entrance (kept) */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {["RDMS", "RDCS", "RVT", "RMSKS"].map((c, i) => (
              <motion.span
                key={c}
                className="t-caption text-[11px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {c}
              </motion.span>
            ))}
            <motion.span
              className="t-label text-[13px] text-[#5a5349]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              — all locked behind the SPI
            </motion.span>
          </div>
        </motion.div>

        {/* Headline — React Bits BlurText (ONE hero animation) */}
        <div className="text-center mb-10 overflow-hidden">
          <BlurText
            text="Pass the SPI. Earn your credential."

            className="t-display text-[clamp(3rem,8vw,7.5rem)] text-gradient-accent"
            delay={80}
            animateBy="words"
            direction="bottom"
            stepDuration={0.4}
            animationFrom={{ filter: "blur(12px)", opacity: 0, y: 20 }}
            animationTo={[
              { filter: "blur(4px)", opacity: 0.6, y: 4 },
              { filter: "blur(0px)", opacity: 1, y: 0 },
            ]}
          />
        </div>

        {/* Subheadline */}
        <motion.p
          className="t-body text-center text-lg max-w-2xl mx-auto mb-14 text-[#B8B0A6]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          The SPI exam blocks every ARDMS credential — RDMS, RDCS, RVT, RMSKS.
          Most students fail not from lack of effort, but because they studied
          the wrong material at the wrong weight. SonoPrep gives you a
          domain-weighted 110-question simulator, 200+ flashcards, and 50
          Physics Pearls — all written by an RDMS instructor to the exact ARDMS
          blueprint.
        </motion.p>

        {/* CTA pair — static, no magnetic/bouncing effects */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          <Link href="/products" className="premium-cta px-12 py-5 text-base">
            Get Full Access — From $9 →
          </Link>
          <Link href="#demo" className="ghost-cta px-12 py-5 text-base">
            Try Free Demo First
          </Link>
        </motion.div>

        {/* Micro-commitment */}
        <motion.div
          className="flex items-center justify-center gap-5 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {["2 minutes", "No signup", "Instant feedback"].map((t, i) => (
            <span key={t}>
              {i > 0 && <span className="text-[#2e2b27] mr-5">·</span>}
              <span className="t-caption text-[#5a554f]">{t}</span>
            </span>
          ))}
        </motion.div>

        {/* Stats — static final numbers, no counter animation */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          {[
            { value: "200+", label: "Flashcards" },
            { value: "111", label: "Question Bank" },
            { value: "50", label: "Physics Pearls" },
            { value: "6", label: "SPI Domains Covered" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center py-4">
              <div className="t-display text-4xl sm:text-5xl">{value}</div>
              <div className="t-caption text-[10px] mt-3 text-[#4a453f]">
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quiet confidence */}
        <motion.p
          className="text-center mt-14 t-subhead text-xl text-[#B8B0A6] italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          You don't need more material. You need the right material.
        </motion.p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION: The Fork — two paths, one obvious choice
   KEPT: fade-up on scroll (once)
   REMOVED: cursor-reactive glow
═══════════════════════════════════════════════════════════════════ */
function TheFork() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-36 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="t-caption">THE FORK</span>
          <h2 className="t-heading text-4xl sm:text-5xl mt-6">
            Two paths. One decision.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Path A — dimmed */}
          <motion.div
            className="lift-card p-10 opacity-50"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 0.5, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="t-caption text-[#5a554f]">PATH A</span>
            <h3 className="t-subhead text-xl mt-4 mb-5">
              Study everything. Hope it's enough.
            </h3>
            <p className="t-body text-sm text-[#5a5349]">
              Read the textbook cover to cover. Do random practice questions.
              Walk in and find out which domains the exam actually weighted. If
              that doesn't work — pay the retake fee.
            </p>
          </motion.div>

          {/* Path B — featured (ONE featured element with glow) */}
          <motion.div
            className="glow-card-featured p-10 relative"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            <div className="absolute top-0 left-0 bg-gradient-to-r from-[#c85b3a] to-[#e06840] px-5 py-2 rounded-br-2xl rounded-tl-[15px]">
              <span className="t-caption text-white text-[10px]">
                WHAT SONOPREP DOES
              </span>
            </div>
            <span className="t-caption text-[#c85b3a] block mt-8">PATH B</span>
            <h3 className="t-subhead text-xl mt-4 mb-5">
              Focus on exactly what ARDMS tests.
            </h3>
            <p className="t-body text-sm">
              Each exam attempt pulls 110 questions from a 111-question bank —
              weighted to the real ARDMS domain distribution. You see exactly
              where you're losing points while there's still time to fix them.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <Link href="#demo" className="premium-cta px-10 py-5 text-sm">
            START WITH THE FREE DEMO →
          </Link>
          <p className="t-caption text-[10px] mt-5 text-[#5a554f]">
            No account · 2 minutes · instant domain feedback
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION: Who is this for — three personas, lift cards
   KEPT: fade-up on scroll (once)
   REMOVED: cursor-reactive glow
═══════════════════════════════════════════════════════════════════ */
function WhoIsThisFor() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const personas = [
    {
      tag: "EXAM IN 2–4 WEEKS",
      head: "Most students don't know what they're weak on until they lose points for it.",
      body: "Retaking the SPI delays every specialty credential. Our domain-weighted simulator shows your weak spots while there's still time to fix them.",
      cta: "Get the Bundle →",
      href: "/products",
    },
    {
      tag: "IN A SONO PROGRAM",
      head: "Your program covers procedures. SonoPrep covers the physics.",
      body: "Most clinical programs don't spend enough time on physics — which is exactly what the SPI tests. 50 Physics Pearls and 200+ flashcards fill that gap.",
      cta: "Try the Demo →",
      href: "#demo",
    },
    {
      tag: "ALREADY FAILED ONCE",
      head: "The problem wasn't effort. It was coverage.",
      body: "The SPI tests 6 domains at specific weightings. If you didn't know which questions came from which domain, you couldn't prioritize. Our analytics fix that.",
      cta: "See the Simulator →",
      href: "/products",
    },
  ];

  return (
    <section ref={ref} className="py-36 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="t-caption">WHO THIS IS FOR</span>
          <h2 className="t-heading text-4xl sm:text-5xl mt-5 max-w-xl">
            If any of these sound like you, you're in the right place.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {personas.map(({ tag, head, body, cta, href }, i) => (
            <motion.div
              key={tag}
              className="lift-card p-9 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.7 }}
            >
              <span className="t-caption text-[10px] mb-6">{tag}</span>
              <h3 className="t-subhead text-base mb-5 leading-snug">{head}</h3>
              <p className="t-body text-sm flex-grow mb-8">{body}</p>
              <Link
                href={href}
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#c85b3a] hover:text-[#e06840] transition-colors border border-[#c85b3a]/25 hover:border-[#c85b3a]/60 rounded-lg px-4 py-2.5 w-fit"
              >
                {cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION: Why Most Fail — editorial, text-driven
   KEPT: fade-up on scroll (once)
   REMOVED: none needed (was already clean)
═══════════════════════════════════════════════════════════════════ */
function WhyMostFail() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const points = [
    {
      head: "The SPI doesn't test evenly.",
      body: "Six domains. Different weightings. Most students prep like every topic matters equally. It doesn't.",
    },
    {
      head: "Blind spots don't surface until test day.",
      body: "You can feel prepared and still fail — because you never identified which specific domains you were actually weak in.",
    },
    {
      head: "Broad studying creates false confidence.",
      body: "Reading a textbook cover to cover feels thorough. But the SPI tests how questions are framed, not just what you know.",
    },
  ];

  return (
    <section ref={ref} className="py-36 px-6 relative">
      {/* Subtle background shift */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090b0e] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="t-caption">WHY MOST STUDENTS FAIL</span>
          <h2 className="t-heading text-4xl sm:text-5xl mt-6 leading-tight">
            It's not that they didn't study.{" "}
            <span className="text-gradient-accent">
              It's that they didn't know which domains would cost them.
            </span>
          </h2>
        </motion.div>

        <div className="mt-16 space-y-5 text-left max-w-xl mx-auto">
          {points.map(({ head, body }, i) => (
            <motion.div
              key={head}
              className="lift-card flex gap-5 p-7"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12 }}
            >
              <span className="text-[#c85b3a] text-base font-semibold shrink-0 mt-0.5">
                →
              </span>
              <div>
                <p className="t-subhead text-sm mb-2">{head}</p>
                <p className="t-body text-sm text-[#7a7269]">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
        >
          <p className="t-subhead text-lg text-[#B8B0A6] italic mb-10 max-w-md mx-auto">
            The question isn't whether you studied enough. It's whether you know
            where you'd lose points today.
          </p>
          <Link href="#demo" className="premium-cta px-10 py-5 text-sm">
            FIND OUT WHERE YOU STAND — FREE →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION: Interactive Demo — the money section
   KEPT: fade-up on scroll (once), tab switching animation
   REMOVED: none needed
═══════════════════════════════════════════════════════════════════ */
function DemoSection() {
  const [activeTab, setActiveTab] = useState<"exam" | "flashcards">("exam");
  const [demoComplete, setDemoComplete] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setDemoComplete(true), 20000);
    return () => clearTimeout(t);
  }, [inView]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setSubmitted(true);
    trackSignup("landing_page");
    try {
      await fetch("/api/demo/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "landing_page" }),
      });
    } catch {
      /* silent */
    }
  };

  return (
    <section id="demo" ref={ref} className="py-36 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080a0d] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="t-caption">TRY IT NOW</span>
          <h2 className="t-heading text-4xl sm:text-5xl mt-5">
            Find out what you'd get wrong
            <br className="hidden sm:block" /> if you took the SPI today.
          </h2>
          <p className="t-body text-base mt-6 max-w-xl mx-auto">
            This is the real simulator. The full version draws 110 questions
            from a 111-question bank — domain-weighted with detailed rationales
            and per-domain analytics.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex gap-1 p-1.5 rounded-2xl bg-[#111318] border border-[#1a1d24]">
            {(["exam", "flashcards"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`t-label px-8 py-3 rounded-xl text-sm tracking-wide transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-[#1B1F28] text-white shadow-lg shadow-black/20"
                    : "text-[#5a5349] hover:text-[#B8B0A6]"
                }`}
              >
                {tab === "exam" ? "Exam Simulator" : "Flashcards"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Demo content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "exam" ? (
                <ExamSimulator questions={DEMO_QUESTIONS.slice(0, 5)} />
              ) : (
                <FlashcardViewer cards={DEMO_FLASHCARDS} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Email capture */}
        {demoComplete && !submitted && (
          <motion.div
            className="mt-14 glow-card-featured p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="t-subhead text-xl mb-3">
              See your SPI weak spots before exam day.
            </h3>
            <p className="t-body text-sm mb-8">
              Get a domain-by-domain breakdown sent to your inbox. No spam.
              Unsubscribe anytime.
            </p>
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-grow px-6 py-4 bg-[#0B0D10] border border-[#1a1d24] text-white placeholder:text-[#5a554f] text-sm rounded-xl focus:outline-none focus:border-[#c85b3a]/30 transition-colors"
              />
              <button
                type="submit"
                className="premium-cta px-8 py-4 whitespace-nowrap text-sm"
              >
                SEND MY DOMAIN BREAKDOWN →
              </button>
            </form>
          </motion.div>
        )}

        {submitted && (
          <motion.div
            className="mt-14 lift-card p-10 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="t-subhead text-lg mb-4">Check your inbox.</h3>
            <p className="t-body text-sm mb-8">
              Your SPI breakdown is on its way.
            </p>
            <Link href="/products" className="premium-cta px-8 py-4 text-sm">
              GET FULL ACCESS →
            </Link>
          </motion.div>
        )}

        {/* Bottom CTA */}
        {!demoComplete && (
          <motion.div
            className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-8"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            <div>
              <p className="t-subhead text-base">
                Ready for the full 110-question exam?
              </p>
              <p className="t-caption text-[10px] mt-2 text-[#5a554f]">
                30-day access · 10-day refund · instant unlock
              </p>
            </div>
            <Link
              href="/products"
              className="premium-cta px-8 py-4 text-sm shrink-0"
            >
              GET FULL ACCESS →
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION: What This Is Not — objection handling
   KEPT: fade-up on scroll (once)
   REMOVED: cursor-reactive glow on regular cards (kept on featured)
═══════════════════════════════════════════════════════════════════ */
function WhatThisIsNot() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-36 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="t-caption">HONEST EXPECTATIONS</span>
          <h2 className="t-heading text-4xl sm:text-5xl mt-5">
            What SonoPrep is not.
          </h2>
        </motion.div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {[
            {
              not: "Not a textbook.",
              is: "Structured SPI prep based on how the exam is actually weighted — not everything the field covers.",
            },
            {
              not: "Not random questions.",
              is: "111 ARDMS domain-weighted questions. Each exam pulls 110 randomly — so every attempt is unique.",
            },
            {
              not: "Not a subscription.",
              is: "One payment. 30-day access (45 for the bundle). No recurring charges. The bundle is $99.",
            },
          ].map(({ not, is }, i) => (
            <motion.div
              key={not}
              className="lift-card p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i }}
            >
              <p className="t-label line-through text-[#4a453f] mb-4">{not}</p>
              <p className="t-body text-sm">{is}</p>
            </motion.div>
          ))}
        </div>

        {/* Hidden objection — ONE featured element with glow kept */}
        <motion.div
          className="mt-10 glow-card-featured p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <span className="t-caption text-[10px] text-[#4a453f]">
            THE QUESTION NOBODY ASKS OUT LOUD
          </span>
          <h3 className="t-subhead text-lg mt-4 mb-4">
            "What if I go through all this and still don't pass?"
          </h3>
          <p className="t-body text-sm max-w-2xl">
            10-day full refund. No hoops, no questions. We're confident enough
            in the material to make buying feel safer than not buying.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-8 premium-cta px-8 py-4 text-sm"
          >
            See Products & Pricing →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION: The System — four steps
   KEPT: fade-up on scroll (once)
   REMOVED: cursor-reactive glow
═══════════════════════════════════════════════════════════════════ */
function TheSystem() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      n: "01",
      label: "Start here",
      action: "Take the free demo",
      detail: "2 minutes, real interface, no account",
    },
    {
      n: "02",
      label: "See your gaps",
      action: "Review domain results",
      detail: "Find out which of the 6 areas need work",
    },
    {
      n: "03",
      label: "Study by domain",
      action: "Flashcards + Physics Pearls",
      detail: "Target exactly what the exam weights",
    },
    {
      n: "04",
      label: "Walk in ready",
      action: "Full 110-question exams",
      detail: "Different questions every attempt",
    },
  ];

  return (
    <section ref={ref} className="py-36 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090b0e] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="t-caption">HOW IT WORKS</span>
          <h2 className="t-heading text-4xl sm:text-5xl mt-5">
            A system, not just a purchase.
          </h2>
          <p className="t-body text-sm mt-5 max-w-lg mx-auto text-[#7a7269]">
            From where you are now to walking into the SPI with a plan.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ n, label, action, detail }, i) => (
            <motion.div
              key={n}
              className="lift-card p-9 relative"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.7 }}
            >
              <div className="t-display text-5xl text-white/[0.06] mb-5">
                {n}
              </div>
              <span className="t-caption text-[10px] text-[#5a554f]">
                {label}
              </span>
              <p className="t-subhead text-sm mt-3 mb-3">{action}</p>
              <p className="t-label text-xs text-[#5a5349]">{detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <Link href="/products" className="premium-cta px-10 py-5 text-sm">
            GET THE FULL SYSTEM — $99 →
          </Link>
          <p className="t-caption text-[10px] mt-5 text-[#5a554f]">
            Or start smaller · Physics Pearls from $9
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION: The Cost — consequence framing
   KEPT: fade-up on scroll (once)
   REMOVED: cursor-reactive glow on regular cards (kept on featured)
═══════════════════════════════════════════════════════════════════ */
function TheCost() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-36 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left — editorial */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="t-caption">THE REAL COST</span>
            <h2 className="t-heading text-4xl mt-5 leading-tight">
              A failed SPI isn't just a failed exam.
            </h2>
            <p className="t-body text-sm mt-8">
              It delays every specialty exam behind it. It means paying ARDMS
              fees again. It means explaining the gap. And it means more months
              studying material you may have already gotten wrong once.
            </p>
            <p className="t-body text-sm mt-5">
              The SPI isn't hard because the physics is hard — it's hard because
              most people study broadly instead of studying precisely what ARDMS
              tests.
            </p>

            <div className="mt-10 lift-card p-7">
              <span className="t-caption text-[10px] text-[#5a554f]">
                IF YOUR EXAM IS COMING UP
              </span>
              <p className="t-body text-sm mt-4">
                For students testing in 2–4 weeks: every day you wait is a day
                you could have found a gap and fixed it. The demo takes 2
                minutes.
              </p>
            </div>
          </motion.div>

          {/* Right — comparison */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            {[
              {
                label: "Broad textbook studying",
                flag: false,
                desc: "Covers everything — including what the exam doesn't test",
              },
              {
                label: "Generic practice tests",
                flag: false,
                desc: "No domain weighting, no rationale, no gap analysis",
              },
              {
                label: "SonoPrep flashcards",
                flag: true,
                desc: "200+ cards mapped to 6 ARDMS SPI domains",
              },
              {
                label: "SonoPrep simulator",
                flag: true,
                desc: "110-question exams from 111-question bank, domain-weighted",
              },
            ].map(({ label, flag, desc }, i) => (
              <motion.div
                key={label}
                className={
                  flag
                    ? "glow-card-featured p-6 flex items-start gap-5"
                    : "lift-card p-6 flex items-start gap-5 opacity-40"
                }
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: flag ? 1 : 0.4, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <span
                  className={`text-sm font-bold shrink-0 mt-0.5 ${flag ? "text-[#c85b3a]" : "text-[#5a554f]"}`}
                >
                  {flag ? "✓" : "✗"}
                </span>
                <div>
                  <p
                    className={`t-label ${flag ? "text-white" : "text-[#4a453f]"}`}
                  >
                    {label}
                  </p>
                  <p className="t-label text-[11px] text-[#5a5349] mt-1.5">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
        >
          <Link href="/products" className="premium-cta px-10 py-5 text-sm">
            SEE THE PREP SYSTEM →
          </Link>
          <p className="t-caption text-[10px] mt-5 text-[#5a554f]">
            10-day refund · 30-day access · instant unlock
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION: Credibility — instructor story + honest proof
   KEPT: fade-up on scroll (once)
   REMOVED: cursor-reactive glow on regular cards (kept on featured)
═══════════════════════════════════════════════════════════════════ */
function Credibility() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-36 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090b0e] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-start">
          {/* Left — instructor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="t-caption">THE INSTRUCTOR</span>
            <h2 className="t-heading text-4xl mt-5 leading-tight">
              This content was taught in a real classroom before it was online.
            </h2>
            <p className="t-body text-sm mt-8">
              SonoPrep's curriculum comes from study materials developed at
              Houston International Cardiotech Ultrasound School — where the
              RDMS instructor behind this content spent years watching students
              struggle with physics, then pass their credentials.
            </p>
            <p className="t-body text-sm mt-5">
              Every flashcard, every exam question, every Physics Pearl was
              written by that instructor — not assembled by a content team, not
              AI-generated.
            </p>

            <div className="mt-10 glow-card-featured p-7">
              <span className="t-caption text-[10px] text-[#4a453f]">
                BUILT TO THE ACTUAL EXAM
              </span>
              <p className="t-body text-sm mt-4">
                Content is built from real SPI exam patterns and ARDMS domain
                weighting — not generic sonography curriculum.
              </p>
            </div>

            {/* Stats grid */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { stat: "10+ yrs", label: "Clinical & teaching" },
                { stat: "RDMS", label: "Active credential" },
                { stat: "6", label: "SPI domains covered" },
              ].map(({ stat, label }, i) => (
                <motion.div
                  key={label}
                  className="lift-card p-5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.08 }}
                >
                  <div className="t-heading text-xl">{stat}</div>
                  <div className="t-caption text-[10px] mt-2 text-[#4a453f]">
                    {label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Credential verification */}
            <motion.div
              className="mt-4 lift-card px-5 py-4 flex items-start gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c85b3a]/15 text-[#c85b3a] text-[10px]">
                ✓
              </span>
              <div>
                <div className="t-caption text-[10px] text-[#c85b3a] tracking-wider">
                  CREDENTIAL VERIFIED
                </div>
                <div className="t-body text-sm text-[#B8B0A6] mt-1">
                  Houston International Cardiotech Ultrasound School (HICUS) —
                  Houston, TX
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — honest proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <span className="t-caption">HONEST ABOUT BEING NEW</span>
            <h3 className="t-subhead text-2xl mt-5 mb-10">
              We don't have 500 reviews yet. Here's what we do have.
            </h3>

            <div className="space-y-5">
              {[
                {
                  head: "Curriculum with a documented track record",
                  body: "Same methodology used at a Houston ultrasound school where students passed RDMS, RDCS, and RVT exams.",
                },
                {
                  head: "Content written to ARDMS specifications",
                  body: "All 6 SPI domains covered at published weightings. The simulator distributes questions accordingly.",
                },
                {
                  head: "10-day refund if it doesn't work",
                  body: "Full refund within 10 days. No hoops. If it's not the right fit, you don't pay.",
                },
              ].map(({ head, body }, i) => (
                <motion.div
                  key={head}
                  className="lift-card p-8"
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.12 }}
                >
                  <h4 className="t-subhead text-sm mb-3">{head}</h4>
                  <p className="t-body text-sm text-[#7a7269]">{body}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 }}
            >
              <Link
                href="/about"
                className="t-caption text-[11px] text-[#5a5349] hover:text-[#c85b3a] transition-colors"
              >
                Read more about the instructor →
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
        >
          <Link href="/products" className="premium-cta px-10 py-5 text-sm">
            GET PREPARED BY AN RDMS INSTRUCTOR →
          </Link>
          <p className="t-caption text-[10px] mt-5 text-[#5a554f]">
            10-day refund · 30-day access · instant unlock
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION: Products — bento grid with featured bundle
   KEPT: fade-up on scroll (once)
   REMOVED: cursor-reactive glow on individual cards (kept on bundle)
   FIXED: access durations to 30d individual / 45d bundle
═══════════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  {
    key: "pearls",
    name: "Physics Pearls",
    price: "$9",
    tag: "THE FIRST STEP",
    desc: "Start studying in 10 minutes. 50 high-yield physics concepts — zero friction.",
    features: [
      "50 concept summaries",
      "Clinical examples",
      "ARDMS domain mapped",
    ],
    featured: false,
  },
  {
    key: "flashcards",
    name: "SPI Flashcards",
    price: "$24",
    tag: "FIX YOUR WEAKEST TOPICS",
    desc: "200+ cards with SM-2 spaced repetition. Most students start here.",
    features: [
      "200+ expert-written cards",
      "SM-2 algorithm",
      "Per-card tracking",
    ],
    featured: false,
  },
  {
    key: "simulator",
    name: "Exam Simulator",
    price: "$49.99",
    tag: "TEST YOURSELF",
    desc: "3 attempts over 30 days. 110 questions from a 111-question bank — domain-weighted, timed, different every time.",
    features: [
      "3 attempts · 30-day access",
      "110 Qs from 111-question bank",
      "2-hour timer (real SPI format)",
      "Per-domain analytics",
    ],
    featured: true,
  },
  {
    key: "notes",
    name: "Study Notes",
    price: "$34",
    tag: "UNDERSTAND THE SYSTEM",
    desc: "Not just memorize answers. 159-page guide covering all 6 SPI domains across 10 chapters.",
    features: ["159 pages", "10 chapters", "All 6 domains"],
    featured: false,
  },
];

function ProductsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-36 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="t-caption">WHAT YOU GET</span>
          <h2 className="t-heading text-4xl sm:text-5xl mt-5 max-w-lg">
            There&apos;s one clear path. A few smaller steps if you&apos;re not
            ready yet.
          </h2>
          <p className="t-body text-sm mt-5 max-w-lg text-[#7a7269]">
            Every product works standalone. But most students get everything —
            because each step naturally leads to the next.
          </p>
        </motion.div>

        {/* Bundle — dominant, full-width, ONE featured element */}
        <motion.div
          className="glow-card-featured p-10 mb-8 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
        >
          <div className="absolute top-0 left-0 bg-gradient-to-r from-[#c85b3a] to-[#e06840] px-6 py-2.5 rounded-br-2xl rounded-tl-[15px]">
            <span className="t-caption text-white text-[10px]">
              RECOMMENDED — BEST VALUE
            </span>
          </div>
          <div className="pt-8 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="t-caption text-[#c85b3a] text-[10px]">
                THE PATH PEOPLE ACTUALLY TAKE
              </span>
              <h3 className="t-heading text-3xl mt-3">Premium Bundle</h3>
              <div className="flex items-baseline gap-3 mt-4 mb-5">
                <span className="t-display text-5xl text-gradient-accent">
                  $99
                </span>
                <span className="t-label text-sm text-[#5a5349] line-through">
                  $116
                </span>
                <span className="t-caption text-[10px] text-[#5a554f]">
                  / 45-day access
                </span>
              </div>
              <p className="t-body text-sm">
                Everything you need to pass — in one system. For less than the
                cost of a single retake fee, you get everything — no piecing
                resources together.
              </p>
            </div>
            <div>
              <ul className="space-y-3 mb-8">
                {[
                  "All 4 products included",
                  "200+ flashcards + 50 Physics Pearls",
                  "110-question exams from 111-question bank",
                  "159-page study notes",
                  "Every exam attempt is different",
                  "45-day full access",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-[#B8B0A6]"
                  >
                    <span className="text-[#c85b3a] text-xs shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/products"
                className="premium-cta w-full block text-center py-5 text-sm"
              >
                GET THE BUNDLE — $99 →
              </Link>
              <p className="t-caption text-[10px] text-center mt-3 text-[#c85b3a]/80 font-medium">
                Most students choose this
              </p>
              <p className="t-caption text-[10px] text-center mt-1 text-[#8a8279]">
                One bad exam costs more than everything you need to pass
              </p>
              <p className="t-caption text-[10px] text-center mt-1 text-[#5a554f]">
                10-day refund · instant access · no subscription
              </p>
            </div>
          </div>
        </motion.div>

        {/* Individual products — lift cards, no glow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.key}
              className={`lift-card p-8 flex flex-col ${product.featured ? "ring-1 ring-[#c85b3a]/15" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25 + i * 0.08 }}
            >
              <span className="t-caption text-[10px] mb-5">{product.tag}</span>
              <h3 className="t-subhead text-base mb-2">{product.name}</h3>
              <div className="text-2xl font-semibold text-white mb-3">
                {product.price}
                <span className="t-caption text-[10px] ml-1.5 text-[#5a554f]">
                  / 30d
                </span>
              </div>
              <p className="t-label text-xs text-[#5a5349] flex-grow mb-7">
                {product.desc}
              </p>
              <Link
                href="/products"
                className="ghost-cta block py-3 text-center text-[11px] tracking-[0.06em] uppercase"
              >
                GET STARTED →
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <motion.div
          className="flex flex-wrap justify-center gap-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
        >
          {[
            "30-day access",
            "10-day refund",
            "Instant access",
            "RDMS instructor",
            "All 6 domains",
          ].map((t) => (
            <span key={t} className="t-caption text-[10px] text-[#5a554f]">
              ✓ {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Sticky Mobile CTA
═══════════════════════════════════════════════════════════════════ */
function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass px-5 py-4 safe-area-bottom"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Link
            href="/products"
            className="premium-cta block w-full text-center py-4 text-sm font-medium"
          >
            Get Full Access — $99 →
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE ASSEMBLY
═══════════════════════════════════════════════════════════════════ */
function LazySection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {show ? children : <div style={{ minHeight: "60vh" }} />}
    </div>
  );
}

export function HomePageClient() {
  return (
    <div className="min-h-screen bg-[#0B0D10]">
      <Header />
      <main>
        <Hero />
        <TheFork />
        <LazySection>
          <WhoIsThisFor />
        </LazySection>
        <LazySection>
          <WhyMostFail />
        </LazySection>
        <LazySection>
          <DemoSection />
        </LazySection>
        <LazySection>
          <WhatThisIsNot />
        </LazySection>
        <LazySection>
          <TheSystem />
        </LazySection>
        <LazySection>
          <TheCost />
        </LazySection>
        <LazySection>
          <Credibility />
        </LazySection>
        <LazySection>
          <ProductsSection />
        </LazySection>
        <LazySection>
          <FaqSection />
        </LazySection>
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
