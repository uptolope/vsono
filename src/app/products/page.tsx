"use client";
import Link from "next/link";
import { useState } from "react";
import { trackCheckoutStarted } from "@/lib/analytics";

// Maps the local product keys used in this page to the server-side
// PRODUCT_PRICE_MAP keys in src/lib/stripe.ts / validations.ts.
const PRODUCT_KEY_MAP: Record<string, string> = {
  bundle: "PREMIUM_BUNDLE",
  flashcards: "FLASHCARDS",
  simulator: "EXAM_SIMULATOR",
  pearls: "PHYSICS_PEARLS",
  notes: "STUDY_NOTES",
};

type Product = {
  key: string;
  name: string;
  price: string;
  strikethrough?: string;
  savings?: string;
  tag: string;
  description: string;
  features: string[];
  bundle: boolean;
  featured: boolean;
  socialProof?: string;
  nudge?: string;
};

// Gravity pricing: every tier points upward toward the bundle.
// Individual prices: $9 + $24 + $34 + $49.99 = $116.99 → display $116.
// Bundle = $99. Save $17. Honest math.
const PRODUCTS: Product[] = [
  {
    key: "bundle",
    name: "Premium Bundle",
    price: "$99",
    strikethrough: "$116",
    savings: "Save $17 vs buying individually",
    tag: "THE PATH PEOPLE ACTUALLY TAKE",
    description:
      "Everything you need to pass — in one system. The flashcard deck, the full domain-weighted simulator, Physics Pearls, and the 159-page study notes. All 6 ARDMS SPI domains. No piecing resources together.",
    features: [
      "200+ flashcards with SM-2 spaced repetition",
      "3 exam attempts · 110 Qs from 111-question bank",
      "50 high-yield Physics Pearls",
      "159-page study notes (10 chapters)",
      "All 6 ARDMS SPI domains covered",
      "Per-domain performance analytics",
      "Detailed clinical rationales",
      "One bad exam costs more than everything you need to pass",
    ],
    bundle: true,
    featured: true,
  },
  {
    key: "pearls",
    name: "Physics Pearls",
    price: "$9",
    tag: "THE FIRST STEP",
    description:
      "Start studying in 10 minutes. 50 high-yield physics principles in concise, memorable form — zero friction, zero commitment. This isn't a product. It's a starting action.",
    features: [
      "50 concept summaries",
      "Clinical application examples",
      "ARDMS domain mapped",
      "Quick reference format",
    ],
    bundle: false,
    featured: false,
  },
  {
    key: "flashcards",
    name: "SPI Flashcards",
    price: "$24",
    tag: "FIX YOUR WEAKEST TOPICS FAST",
    description:
      "This is where commitment begins. 200+ clinically focused flashcards with SM-2 spaced repetition — the algorithm prioritizes what you're getting wrong, so 30 minutes a day actually moves the needle.",
    features: [
      "200+ expert-written flashcards",
      "SM-2 spaced repetition",
      "Progress tracking per card",
      "Covers all 6 ARDMS SPI domains",
    ],
    bundle: false,
    featured: false,
    socialProof: "Most students start here",
  },
  {
    key: "notes",
    name: "Study Notes",
    price: "$34",
    tag: "UNDERSTAND THE SYSTEM",
    description:
      "Understand the system — not just memorize answers. 159-page comprehensive guide covering all 6 SPI domains across 10 chapters. For students who want to master the material, not just pass.",
    features: [
      "159 pages of content",
      "10 organized chapters",
      "Progress tracking",
      "Covers all 6 SPI domains",
    ],
    bundle: false,
    featured: false,
  },
  {
    key: "simulator",
    name: "Exam Simulator",
    price: "$49.99",
    tag: "TEST YOURSELF",
    description:
      "3 exam attempts over 30 days. Each draws 110 random questions from a 111-question bank — ARDMS domain-weighted, 2-hour timer, with detailed rationales. Per-domain analytics show exactly where you're losing points.",
    features: [
      "3 attempts · 30-day access",
      "111-question bank · 110 questions per exam",
      "2-hour timer (real SPI format)",
      "Randomized & domain-weighted",
      "Detailed clinical rationales",
      "Per-domain performance analytics",
    ],
    bundle: false,
    featured: true,
    nudge: "Most users upgrade to the full bundle after 1–2 exams",
  },
];

export default function ProductsPage() {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleCheckout = async (productKey: string) => {
    const serverKey = PRODUCT_KEY_MAP[productKey];
    if (!serverKey) {
      alert("Unknown product. Please contact support.");
      return;
    }

    const product = PRODUCTS.find((p) => p.key === productKey);
    const priceNum = product ? parseFloat(product.price.replace("$", "")) : 0;
    trackCheckoutStarted(serverKey, priceNum);

    setCheckoutLoading(productKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: serverKey }),
      });

      if (res.status === 401) {
        // Not logged in — redirect to signup, then back to products
        window.location.href = `/signup`;
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(typeof data.error === "string" ? data.error : "Checkout failed.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const bundle = PRODUCTS.find((p) => p.bundle)!;
  const individual = PRODUCTS.filter((p) => !p.bundle);

  return (
    <div className="min-h-screen pt-32 px-6 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-14 border-b border-white/6 pb-10">
          <span className="meta">SPI EXAM PREP</span>
          <h1 className="display-display text-5xl sm:text-6xl mt-4 leading-[1.06]">
            There is one clear path
            <br />
            <span className="text-[#c85b3a]">to passing the SPI.</span>
          </h1>
          <p className="body-readable text-[#c2bab0] max-w-xl mt-5">
            Most students get the bundle. If you want to start smaller, Physics
            Pearls at $9 gets you studying in 10 minutes — and every step after
            that leads to the same place.
          </p>

          {/* What this is not — decision filter */}
          <div className="mt-7 p-5 border border-white/5 bg-[#f0ebe4]/[0.01]">
            <p className="meta text-[9px] text-[#4a453f] mb-3">
              BEFORE YOU BUY — SET THE RIGHT EXPECTATION
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  not: "Not a textbook",
                  is: "Structured SPI prep based on ARDMS exam weighting",
                },
                {
                  not: "Not random practice tests",
                  is: "110 questions drawn from 111-question bank, mapped to 6 domains at real exam ratios",
                },
                {
                  not: "Not a subscription",
                  is: "One payment. 30-day access. 10-day full refund policy.",
                },
              ].map(({ not, is }) => (
                <div key={not}>
                  <p className="meta text-[9px] text-[#c85b3a] line-through mb-1">
                    {not}
                  </p>
                  <p className="body-small text-[#8a8279] text-xs">{is}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="meta text-[9px] text-[#3a3530] mt-4">
            Individual products include 30-day access · Premium Bundle includes
            45-day access · 10-day full refund policy · Instant unlock after checkout
          </p>
        </div>

        {/* Bundle — the decision */}
        <p className="meta text-[10px] text-[#c85b3a]/80 font-medium mb-3 text-center">
          Most students choose this
        </p>
        <div
          id="bundle"
          className="scroll-mt-28 depth-border corner-arch p-8 sm:p-10 mb-10 relative border-[#c85b3a]/30 bg-[#c85b3a]/[0.04] ring-1 ring-[#c85b3a]/10"
        >
          <div className="absolute top-0 left-0 bg-[#c85b3a] px-4 py-1.5 text-[9px] meta text-white tracking-wider">
            MOST POPULAR
          </div>
          <div className="pt-4 grid md:grid-cols-2 gap-10 items-start">
            <div>
              <div className="meta text-[9px] text-[#c85b3a] mb-2">
                {bundle.tag}
              </div>
              <h2 className="display-serif text-2xl font-bold text-white mb-3">
                {bundle.name}
              </h2>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-[#c85b3a]">
                  {bundle.price}
                </span>
                <span className="text-sm text-[#4a453f] line-through">
                  {bundle.strikethrough}
                </span>
                <span className="meta text-[9px] text-[#3a3530]">
                  / 45-day access
                </span>
              </div>
              <p className="meta text-[10px] text-[#c85b3a]/70 mb-4">
                {bundle.savings}
              </p>
              <p className="body-readable text-[#c2bab0] text-sm leading-relaxed">
                {bundle.description}
              </p>

              {/* Risk reversal */}
              <div className="mt-5 p-4 border border-white/5 bg-[#f0ebe4]/[0.01]">
                <p className="meta text-[9px] text-[#4a453f] mb-1">
                  10-DAY REFUND POLICY
                </p>
                <p className="body-small text-[#8a8279] text-xs leading-relaxed">
                  If you go through this and still don't feel prepared, you get
                  your money back. No questions about how much you used it.
                  We're confident enough in the material to make buying feel
                  safer than not buying.
                </p>
              </div>
            </div>
            <div>
              <ul className="space-y-2.5 mb-7">
                {bundle.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-[#c2bab0]"
                  >
                    <span className="text-[#c85b3a] text-xs shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout("bundle")}
                className="btn-industrial w-full py-4 text-[11px]"
              >
                GET THE BUNDLE — $99 →
              </button>
              <p className="meta text-[10px] text-[#8a8279] text-center mt-2">
                One bad exam costs more than everything you need to pass
              </p>
              <p className="meta text-[9px] text-[#3a3530] text-center mt-1">
                10-day full refund · instant access · no subscription
              </p>
            </div>
          </div>
        </div>

        {/* Individual products — each step leads upward */}
        <div className="mb-4">
          <p className="meta text-[10px] text-[#3a3530] mb-5">
            OR TAKE ONE STEP AT A TIME
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {individual.map((product) => (
            <div
              key={product.key}
              id={product.key}
              className={`scroll-mt-28 depth-border corner-arch p-6 tactile-card relative flex flex-col ${product.featured ? "border-l-[3px] border-l-[#c85b3a]/50" : ""}`}
            >
              <div className="flex-grow">
                <div className="meta text-[9px] text-[#4a453f] mb-2">
                  {product.tag}
                </div>
                <h3 className="display-serif text-lg font-semibold text-white mb-1">
                  {product.name}
                </h3>
                <div className="text-2xl font-semibold text-[#c85b3a] mb-3">
                  {product.price}
                  <span className="text-[9px] text-[#4a453f] ml-1">
                    / 30-day access
                  </span>
                </div>
                <p className="body-small text-[#c2bab0] text-sm leading-relaxed mb-5">
                  {product.description}
                </p>
                {product.socialProof && (
                  <p className="meta text-[10px] text-[#c85b3a]/70 mb-4">
                    ({product.socialProof})
                  </p>
                )}
                <ul className="space-y-1.5 mb-6">
                  {product.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-xs text-[#8a8279]"
                    >
                      <span className="text-[#c85b3a] shrink-0">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleCheckout(product.key)}
                className="btn-industrial-outline w-full py-3 text-center text-[10px]"
              >
                GET {product.name.toUpperCase()} →
              </button>
              {product.nudge && (
                <p className="meta text-[9px] text-[#8a8279] text-center mt-2">
                  {product.nudge}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Try before you buy */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="display-serif text-base font-semibold text-white mb-1">
              Not sure yet?
            </p>
            <p className="body-small text-[#8a8279] text-sm">
              Try the exam simulator and flashcards free — no account required.
            </p>
          </div>
          <Link
            href="/demo"
            className="btn-industrial-outline px-6 py-3 text-[10px] shrink-0"
          >
            TRY FREE DEMO →
          </Link>
        </div>

        {/* Legal */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="meta text-[9px] text-[#2e2b27]">
            © {new Date().getFullYear()} SonoPrep. All content is original and
            copyright protected. Unauthorized redistribution is prohibited.
            SonoPrep is not affiliated with or endorsed by ARDMS. SPI® is a
            registered trademark of ARDMS.
          </p>
        </div>
      </div>
    </div>
  );
}
