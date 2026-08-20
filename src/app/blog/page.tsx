import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SonoPrep Blog — SPI Exam Study Tips, Physics & ARDMS Guides",
  description:
    "Free study resources for ARDMS SPI exam candidates. Ultrasound physics, Doppler principles, test-taking strategies, domain breakdowns, and credential comparisons.",
  keywords: [
    "SPI exam blog",
    "ARDMS SPI study tips",
    "ultrasound physics guide",
    "SPI exam prep articles",
    "sonography exam resources",
  ],
  openGraph: {
    title: "SonoPrep Blog — SPI Exam Study Tips & ARDMS Guides",
    description:
      "Free study resources for the ARDMS SPI exam. Physics, Doppler, test strategies, and credential guides.",
    url: "https://sonoprep.com/blog",
    siteName: "SonoPrep",
    type: "website",
  },
  alternates: {
    canonical: "https://sonoprep.com/blog",
  },
};

const POSTS = [
  {
    slug: "complete-spi-exam-guide",
    tag: "COMPLETE GUIDE",
    title: "The Complete ARDMS SPI Exam Guide: Everything You Need to Pass",
    desc: "Domain weightings, a proven 6-week study plan, common mistakes, and how to pass on your first attempt.",
    date: "May 12, 2026",
    read: "25 min read",
  },
  {
    slug: "ardms-exam-blueprint",
    tag: "EXAM BLUEPRINT",
    title: "ARDMS SPI Exam Blueprint 2026: Domain Weightings Explained",
    desc: "A breakdown of the official ARDMS content outline — exactly how many questions come from each domain and how to allocate your study time.",
    date: "April 26, 2026",
    read: "17 min read",
  },
  {
    slug: "doppler-principles-spi-exam",
    tag: "PHYSICS",
    title:
      "Doppler Principles for the SPI Exam: Nyquist, Aliasing & Spectral Analysis",
    desc: "The Doppler domain is 22% of the SPI. This guide covers every concept the ARDMS tests — with clear explanations and exam-style examples.",
    date: "April 18, 2026",
    read: "20 min read",
  },
  {
    slug: "ultrasound-physics-spi",
    tag: "PHYSICS",
    title:
      "Ultrasound Physics for the SPI Exam: The 6 Concepts That Actually Appear",
    desc: "Cut through the noise. These are the physics concepts responsible for the majority of SPI exam questions, explained so they actually stick.",
    date: "April 10, 2026",
    read: "18 min read",
  },
  {
    slug: "ultrasound-artifacts-spi",
    tag: "IMAGE QUALITY",
    title: "Ultrasound Artifacts: The 7 Most Common SPI Exam Questions",
    desc: "Reverberation, shadowing, comet-tail, mirror image — the ARDMS tests these every time. Learn to identify and explain each one.",
    date: "April 3, 2026",
    read: "15 min read",
  },
  {
    slug: "pass-spi-first-attempt",
    tag: "STUDY STRATEGY",
    title: "How to Pass the SPI Exam on Your First Attempt: A 6-Week Blueprint",
    desc: "A week-by-week schedule built around the ARDMS blueprint, designed to get you exam-ready in 42 days.",
    date: "March 28, 2026",
    read: "14 min read",
  },
  {
    slug: "spaced-repetition-spi-exam",
    tag: "STUDY STRATEGY",
    title:
      "Spaced Repetition for SPI Exam Success: Why Active Recall Beats Cramming",
    desc: "The science behind why SonoPrep's flashcard system is built on SM-2 spaced repetition — and how to use it to retain physics concepts long-term.",
    date: "March 20, 2026",
    read: "12 min read",
  },
  {
    slug: "test-taking-strategies-spi",
    tag: "TEST STRATEGY",
    title:
      "SPI Exam Test-Taking Strategies: Eliminate Wrong Answers & Manage Time",
    desc: "How to handle tricky ARDMS question stems, eliminate distractors, and keep your pace across 110 questions in 2 hours.",
    date: "March 14, 2026",
    read: "11 min read",
  },
  {
    slug: "ardms-specialties-comparison",
    tag: "CREDENTIAL GUIDE",
    title:
      "RDMS vs RDCS vs RVT vs RMSKS: Which ARDMS Specialty Is Right for You?",
    desc: "A practical comparison of the four ARDMS specialty credentials — clinical requirements, exam structure, job market, and how to choose your path.",
    date: "March 6, 2026",
    read: "13 min read",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen pt-32 px-6">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="meta text-[11px] text-[#8a8279] hover:text-[#c85b3a] mb-8 inline-block"
        >
          ← BACK TO HOME
        </Link>

        <div className="text-center mb-16">
          <span className="meta text-[#c85b3a] text-sm">FREE RESOURCES</span>
          <h1 className="display-display text-5xl sm:text-6xl text-white mt-4 mb-4">
            SonoPrep Blog
          </h1>
          <p className="body-readable text-[#c2bab0] max-w-2xl mx-auto">
            Study guides, physics breakdowns, exam strategies, and credential
            comparisons — written by credentialed sonographers for SPI exam
            candidates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="depth-border corner-arch p-6 tactile-card group block"
            >
              <div className="inline-block bg-[#c85b3a] px-2 py-0.5 text-[10px] meta text-white mb-3">
                {post.tag}
              </div>
              <h2 className="display-serif text-lg font-semibold text-white mb-2 group-hover:text-[#c85b3a] transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="body-small text-[#c2bab0] text-sm mb-4 leading-relaxed">
                {post.desc}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#8a8279] meta">
                <span>{post.date}</span>
                <span className="w-1 h-1 bg-[#c85b3a] rounded-full" />
                <span>{post.read}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-[#c85b3a]/10 border-l-[3px] border-[#c85b3a] p-8">
          <p className="body-readable text-white text-sm mb-4">
            Ready to put this knowledge to work? SonoPrep's exam simulator and
            flashcard system are built around the exact domains covered in these
            articles.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/demo" className="btn-industrial text-sm px-5 py-2.5">
              Try Free Demo
            </Link>
            <Link
              href="/products"
              className="text-sm text-[#c85b3a] hover:text-white border border-[#c85b3a]/40 px-5 py-2.5 transition-colors"
            >
              View Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
