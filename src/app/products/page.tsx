"use client";

import Link from "next/link";
import { useState } from "react";
import { getGaClientId, trackCheckoutStarted } from "@/lib/analytics";

// Maps the local product keys used on this page to the server-side
// PRODUCT_PRICE_MAP keys in src/lib/stripe.ts and validations.ts.
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

// Individual prices:
// $9 + $24 + $34 + $49.99 = $116.99
// Bundle price: $99
// Displayed savings: $17.99
const PRODUCTS: Product[] = [
  {
    key: "bundle",
    name: "Premium Bundle",
    price: "$99",
    strikethrough: "$116.99",
    savings: "Save $17.99 vs buying individually",
    tag: "BEST VALUE",
    description:
      "Everything you need to pass — in one system. The flashcard deck, the full exam simulator, Physics Pearls, and the 159-page study notes. All 5 ARDMS SPI domains. No piecing resources together.",
    features: [
      "200 flashcards with SM-2 spaced repetition",
      "3 exam attempts · 110 independently written questions from SonoPrep’s 155-question bank",
      "50 high-yield Physics Pearls",
      "159-page study notes (15 chapters)",
      "All 5 ARDMS SPI domains covered",
      "Per-domain performance analytics",
      "Detailed clinical rationales",
      "45 days of full access from purchase",
      "One payment · no recurring subscription",
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
      "SPI outline aligned",
      "Quick reference format",
      "30 days of access from purchase",
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
      "This is where commitment begins. 200 clinically focused flashcards with SM-2 spaced repetition — the algorithm prioritizes what you're getting wrong, so 30 minutes a day actually moves the needle.",
    features: [
      "200 expert-written flashcards",
      "SM-2 spaced repetition",
      "Progress tracking per card",
      "Covers all 5 ARDMS SPI domains",
      "30 days of access from purchase",
    ],
    bundle: false,
    featured: false,
  },
  {
    key: "notes",
    name: "Study Notes",
    price: "$34",
    tag: "UNDERSTAND THE SYSTEM",
    description:
      "Understand the system — not just memorize answers. 159-page comprehensive guide covering all 5 SPI domains across 15 chapters. For students who want to master the material, not just pass.",
    features: [
      "159 pages of content",
      "15 organized chapters",
      "Progress tracking",
      "Covers all 5 SPI domains",
      "30 days of access from purchase",
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
      "3 exam attempts over 30 days. Each draws 110 random questions from a 155-question bank, 2-hour timer, with detailed rationales. Per-domain analytics show exactly where you're losing points.",
    features: [
      "3 attempts · 30-day access",
      "155-question bank · 110 questions per exam",
      "Two-hour practice timer",
      "Randomized each time",
      "Detailed clinical rationales",
      "Per-domain performance analytics",
      "30 days of access from purchase",
    ],
    bundle: false,
    featured: true,
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

    const product = PRODUCTS.find((item) => item.key === productKey);
    const priceNum = product
      ? parseFloat(product.price.replace("$", ""))
      : 0;

    trackCheckoutStarted(serverKey, priceNum);
    setCheckoutLoading(productKey);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: serverKey,
          gaClientId: getGaClientId(),
        }),
      });

      if (res.status === 401) {
        window.location.href = "/signup";
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.error) {
        alert(
          typeof data.error === "string"
            ? data.error
            : "Checkout failed."
        );
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const bundle = PRODUCTS.find((product) => product.bundle);

  if (!bundle) {
    return null;
  }

  const individual = PRODUCTS.filter((product) => !product.bundle);

  return (
    <div className="min-h-screen px-6 pb-24 pt-32">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <div className="mb-14 border-b border-white/6 pb-10">
          <span className="meta">SPI EXAM PREP</span>

          <h1 className="display-display mt-4 text-5xl leading-[1.06] sm:text-6xl">
            There is one clear path
            <br />
            <span className="text-[#c85b3a]">to passing the SPI.</span>
          </h1>

          <p className="body-readable mt-5 max-w-xl text-[#c2bab0]">
            The bundle is the best value. If you want to start smaller,
            Physics Pearls at $9 gets you studying in 10 minutes — and every
            step after that leads to the same place.
          </p>

          {/* What this is not — decision filter */}
          <div className="mt-7 border border-white/5 bg-[#f0ebe4]/[0.01] p-5">
            <p className="meta mb-3 text-[9px] text-[#4a453f]">
              BEFORE YOU BUY — SET THE RIGHT EXPECTATION
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  not: "Not a textbook",
                  is: "Structured SPI prep based on ARDMS exam weighting",
                },
                {
                  not: "Not random practice tests",
                  is: "110 questions drawn from 155-question bank, mapped to 5 domains at real exam ratios",
                },
                {
                  not: "Not a subscription",
                  is: "One payment. 30-day access. 10-day full refund policy.",
                },
              ].map(({ not, is }) => (
                <div key={not}>
                  <p className="meta mb-1 text-[9px] text-[#c85b3a] line-through">
                    {not}
                  </p>
                  <p className="body-small text-xs text-[#8a8279]">
                    {is}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="meta mt-4 text-[9px] text-[#3a3530]">
            Individual products include 30-day access · Premium Bundle
            includes 45-day access · 10-day full refund policy · Instant
            unlock after checkout
          </p>
        </div>

        {/* Bundle */}
        <p className="meta mb-3 text-center text-[10px] font-medium text-[#c85b3a]/80">
          Complete preparation in one purchase
        </p>

        <div
          id="bundle"
          className="corner-arch depth-border relative mb-10 scroll-mt-28 border-[#c85b3a]/30 bg-[#c85b3a]/[0.04] p-8 ring-1 ring-[#c85b3a]/10 sm:p-10"
        >
          <div className="meta absolute left-0 top-0 bg-[#c85b3a] px-4 py-1.5 text-[9px] tracking-wider text-white">
            MOST POPULAR
          </div>

          <div className="grid items-start gap-10 pt-4 md:grid-cols-2">
            <div>
              <div className="meta mb-2 text-[9px] text-[#c85b3a]">
                {bundle.tag}
              </div>

              <h2 className="display-serif mb-3 text-2xl font-bold text-white">
                {bundle.name}
              </h2>

              <div className="mb-2 flex items-baseline gap-3">
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

              <p className="meta mb-4 text-[10px] text-[#c85b3a]/70">
                {bundle.savings}
              </p>

              <p className="body-readable text-sm leading-relaxed text-[#c2bab0]">
                {bundle.description}
              </p>

              {/* Risk reversal */}
              <div className="mt-5 border border-white/5 bg-[#f0ebe4]/[0.01] p-4">
                <p className="meta mb-1 text-[9px] text-[#4a453f]">
                  10-DAY REFUND POLICY
                </p>

                <p className="body-small text-xs leading-relaxed text-[#8a8279]">
                  If you go through this and still don&apos;t feel prepared,
                  you get your money back. No questions about how much you
                  used it. We&apos;re confident enough in the material to make
                  buying feel safer than not buying.
                </p>
              </div>
            </div>

            <div>
              <ul className="mb-7 space-y-2.5">
                {bundle.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-[#c2bab0]"
                  >
                    <span className="shrink-0 text-xs text-[#c85b3a]">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleCheckout("bundle")}
                disabled={checkoutLoading !== null}
                aria-busy={checkoutLoading === "bundle"}
                className="btn-industrial w-full py-4 text-[11px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading === "bundle"
                  ? "PROCESSING..."
                  : "GET THE BUNDLE — $99 →"}
              </button>

              <p className="meta mt-2 text-center text-[10px] text-[#8a8279]">
                One payment · no recurring subscription
              </p>

              <p className="meta mt-1 text-center text-[9px] text-[#3a3530]">
                10-day full refund · instant access · no subscription
              </p>
            </div>
          </div>
        </div>

        {/* Individual products */}
        <div className="mb-4">
          <p className="meta mb-5 text-[10px] text-[#3a3530]">
            OR TAKE ONE STEP AT A TIME
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {individual.map((product) => (
            <div
              key={product.key}
              id={product.key}
              className={`corner-arch depth-border tactile-card relative flex scroll-mt-28 flex-col p-6 ${
                product.featured
                  ? "border-l-[3px] border-l-[#c85b3a]/50"
                  : ""
              }`}
            >
              <div className="flex-grow">
                <div className="meta mb-2 text-[9px] text-[#4a453f]">
                  {product.tag}
                </div>

                <h3 className="display-serif mb-1 text-lg font-semibold text-white">
                  {product.name}
                </h3>

                <div className="mb-3 text-2xl font-semibold text-[#c85b3a]">
                  {product.price}

                  <span className="ml-1 text-[9px] text-[#4a453f]">
                    / 30-day access
                  </span>
                </div>

                <p className="body-small mb-5 text-sm leading-relaxed text-[#c2bab0]">
                  {product.description}
                </p>

                {product.socialProof && (
                  <p className="meta mb-4 text-[10px] text-[#c85b3a]/70">
                    ({product.socialProof})
                  </p>
                )}

                <ul className="mb-6 space-y-1.5">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-xs text-[#8a8279]"
                    >
                      <span className="shrink-0 text-[#c85b3a]">—</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleCheckout(product.key)}
                disabled={checkoutLoading !== null}
                aria-busy={checkoutLoading === product.key}
                className="btn-industrial-outline w-full py-3 text-center text-[10px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading === product.key
                  ? "PROCESSING..."
                  : `GET ${product.name.toUpperCase()} →`}
              </button>

              {product.nudge && (
                <p className="meta mt-2 text-center text-[9px] text-[#8a8279]">
                  {product.nudge}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Try before you buy */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <div>
            <p className="display-serif mb-1 text-base font-semibold text-white">
              Not sure yet?
            </p>

            <p className="body-small text-sm text-[#8a8279]">
              Try the exam simulator and flashcards free — no account required.
            </p>
          </div>

          <Link
            href="/demo"
            className="btn-industrial-outline shrink-0 px-6 py-3 text-[10px]"
          >
            TRY FREE DEMO →
          </Link>
        </div>

        {/* Legal */}
        <div className="mt-12 border-t border-white/5 pt-6 text-center">
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