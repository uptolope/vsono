"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";

const INCLUSIONS = [
  "200+ RDMS-written flashcards",
  "3 exam attempts · 110 Qs from 111-question bank",
  "50 Physics Pearls",
  "Domain performance analytics",
  "Detailed clinical rationales",
  "30-day access (45 for bundle)",
];

export function CtaSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Subtle background shift */}
      <div className="absolute inset-0 bg-[#0a0c0f]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Headline */}
        <p className="t-caption mb-6">Ready to Pass?</p>
        <h2 className="t-heading text-5xl sm:text-6xl lg:text-7xl leading-tight">
          Know your weak spots
          <br />
          <span className="text-[#c85b3a]">before the SPI does.</span>
        </h2>

        <p className="t-body mx-auto mt-8 max-w-xl text-lg">
          Every product is structured around the exact ARDMS exam blueprint.
          That&apos;s not a guess — that&apos;s by design.
        </p>

        {/* What's included */}
        <div className="mx-auto mt-14 grid max-w-lg grid-cols-2 gap-4 text-left">
          {INCLUSIONS.map((item) => (
            <div
              key={item}
              className="group flex items-center gap-3 premium-card px-5 py-4 rounded-lg"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c85b3a]/10 shrink-0">
                <CheckCircle2 className="h-4 w-4 text-[#c85b3a]" />
              </div>
              <span className="t-label text-sm group-hover:text-white transition-colors">
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Price box */}
        <div className="mt-16 inline-flex flex-col items-center premium-featured p-10 rounded-lg relative">
          {/* Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full bg-[#0B0D10] border border-[#c85b3a]/20 px-4 py-1">
              <Shield className="h-3 w-3 text-[#c85b3a]" />
              <span className="t-caption text-[#c85b3a]">Save $17</span>
            </div>
          </div>

          <div className="text-center">
            <span className="t-caption mb-3 block">Premium Bundle</span>

            <div className="flex items-end gap-3 justify-center">
              <span className="t-display text-5xl">$99</span>
              <span className="t-label mb-3 text-[#5a5349]">one-time</span>
            </div>

            <div className="mt-4 flex items-center gap-2 justify-center">
              <span className="t-label text-sm text-[#5a5349] line-through">
                $116
              </span>
              <span className="t-label text-xs text-[#7a7269]">
                vs buying separately
              </span>
            </div>
          </div>
        </div>

        <p className="t-label mt-5 text-sm text-[#5a5349]">
          Or start with individual products from $9
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="premium-cta inline-flex items-center justify-center px-10 py-5 rounded-md text-base font-medium"
          >
            Get the Full Prep System — $99
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

          <Link
            href="/demo"
            className="ghost-cta inline-flex items-center justify-center px-10 py-5 text-base"
          >
            Try Free Demo First
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {[
            { icon: Shield, text: "Secure checkout" },
            { icon: Zap, text: "Instant access" },
            { icon: CheckCircle2, text: "No subscription" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 t-label text-xs text-[#5a5349]"
            >
              <Icon className="h-3.5 w-3.5 text-[#5a5349]" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
