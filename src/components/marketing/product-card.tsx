"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Lightbulb,
  GraduationCap,
  FileText,
  Package,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
export interface ProductData {
  key: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  icon: LucideIcon;
  popular?: boolean;
  savingsLabel?: string;
}

/* ─── Product data ───────────────────────────────────────────────── */
const INDIVIDUAL_TOTAL = 11600;

export const PRODUCTS: ProductData[] = [
  {
    key: "PHYSICS_PEARLS",
    name: "Physics Pearls",
    price: 900,
    description:
      "Start studying in 10 minutes. 50 high-yield physics principles — concise, memorable, and mapped to what ARDMS actually tests.",
    features: [
      "50 high-yield concept summaries",
      "Clinical application examples",
      "ARDMS domain mapping",
      "Quick reference format",
    ],
    icon: Lightbulb,
  },
  {
    key: "SPI_FLASHCARDS",
    name: "SPI Flashcards",
    price: 2400,
    description:
      "Fix your weakest topics fast. 200+ clinically focused flashcards with SM-2 spaced repetition — the algorithm prioritizes what you're getting wrong.",
    features: [
      "200+ expert-written flashcards",
      "SM-2 spaced repetition algorithm",
      "Progress tracking per card",
      "Covers all 6 ARDMS SPI domains",
    ],
    icon: BookOpen,
  },
  {
    key: "STUDY_NOTES",
    name: "Study Notes",
    price: 3400,
    description:
      "Understand the system — not just memorize answers. 159-page comprehensive guide covering all 6 SPI domains across 10 organized chapters.",
    features: [
      "159 pages of content",
      "10 organized chapters",
      "Reading progress tracking",
      "Covers all 6 SPI domains",
    ],
    icon: FileText,
  },
  {
    key: "EXAM_SIMULATOR",
    name: "Exam Simulator",
    price: 4999,
    description:
      "3 full exam attempts over 30 days. Each attempt draws 110 random questions from a 111-question bank — ARDMS domain-weighted, timed at 2 hours, with detailed rationales and per-domain analytics.",
    features: [
      "3 exam attempts · 30-day access",
      "111-question bank · 110 per exam",
      "2-hour timer (matches real SPI)",
      "Randomized & domain-weighted each time",
      "Detailed clinical rationales",
      "Per-domain performance analytics",
    ],
    icon: GraduationCap,
    popular: true,
  },
  {
    key: "PREMIUM_BUNDLE",
    name: "Premium Bundle",
    price: 9900,
    originalPrice: INDIVIDUAL_TOTAL,
    description:
      "Everything you need to pass — in one system. For less than the cost of a single retake fee, you get the complete system: flashcards, simulator, Physics Pearls, and study notes.",
    features: [
      "All 4 products included",
      "200+ flashcards + 50 Pearls",
      "3 exam attempts · 110 questions from 111-question bank",
      "159-page study notes",
      "One bad exam costs more than everything you need to pass",
      "45-day full access",
    ],
    icon: Package,
    savingsLabel: "Most Students Choose This",
  },
];

/* ─── Trust bar ──────────────────────────────────────────────────── */
function TrustBar() {
  return (
    <div className="flex flex-wrap justify-center gap-6 text-xs text-cream-dim/50">
      {[
        { icon: ShieldCheck, text: "10-day refund policy" },
        { icon: Zap, text: "Instant access after checkout" },
        { icon: ShieldCheck, text: "Written by an RDMS instructor" },
        { icon: Clock, text: "30-day access" },
      ].map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-[#c85b3a]/50" />
          {text}
        </div>
      ))}
    </div>
  );
}

/* ─── Bundle value strip ─────────────────────────────────────────── */
function BundleValueStrip() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#c85b3a]/20 bg-[#c85b3a]/[0.04] px-4 py-2.5">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#c85b3a]/70" />
      <span className="text-xs text-cream-dim/70">
        45-day access to all 4 products · 10-day full refund policy · no
        subscription
      </span>
    </div>
  );
}

/* ─── Product Card ───────────────────────────────────────────────── */
interface ProductCardProps {
  product: ProductData;
  onPurchase?: (key: string) => void;
}

function ProductCard({ product, onPurchase }: ProductCardProps) {
  const isBundle = product.key === "PREMIUM_BUNDLE";

  return (
    <div className="group relative">
      <Card
        className={`relative overflow-hidden transition-all duration-300 ease-out hover:translate-y-[-4px] ${
          isBundle
            ? "border-[#c85b3a]/40 shadow-[0_0_40px_rgba(200,91,58,0.15)] col-span-1 sm:col-span-2 bg-gradient-to-br from-charcoal via-slate/80 to-charcoal"
            : "hover:border-[#c85b3a]/30 hover:shadow-[0_0_40px_rgba(200,91,58,0.15)] bg-gradient-to-br from-charcoal/90 via-slate/60 to-charcoal/90"
        }`}
      >
        {/* Hover glow — static, CSS only */}
        <div className="pointer-events-none absolute inset-0 rounded opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-[#c85b3a]/[0.04] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c85b3a]/0 to-transparent transition-all duration-500 group-hover:via-[#c85b3a]/50" />

        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mist transition-all duration-300 group-hover:bg-[#c85b3a]/10">
              <product.icon className="h-6 w-6 text-[#c85b3a] transition-colors duration-300 group-hover:text-[#e06840]" />
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {product.popular && (
                <Badge className="border-[#c85b3a]/40 bg-[#c85b3a]/10 text-[#c85b3a]">
                  Most Popular
                </Badge>
              )}
              {product.savingsLabel && (
                <Badge className="border-[#c85b3a]/30 bg-[#c85b3a]/10 text-[#e06840]">
                  {product.savingsLabel}
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="mt-5 text-2xl font-bold text-cream group-hover:text-[#e06840] transition-colors duration-300">
            {product.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-5">
          <p className="text-base text-cream-dim leading-relaxed">
            {product.description}
          </p>

          {/* Price block */}
          <div className="relative">
            <div className="space-y-1 p-4 rounded-lg bg-obsidian/30">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-4xl font-bold text-cream group-hover:text-[#e06840] transition-colors duration-300">
                  {formatCurrency(product.price)}
                </span>
                {isBundle && product.originalPrice && (
                  <span className="font-mono text-lg text-cream-dim/40 line-through decoration-red-400/50">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                <span className="font-mono text-xs text-cream-dim/50">
                  / {isBundle ? "45-day access" : "30-day access"}
                </span>
              </div>
              {isBundle && product.originalPrice && (
                <p className="font-mono text-sm text-[#c85b3a]/70 flex items-center gap-2">
                  <span>↓</span>
                  Save {formatCurrency(product.originalPrice - product.price)}{" "}
                  vs buying individually
                </p>
              )}
            </div>
          </div>

          {/* Bundle value strip */}
          {isBundle && <BundleValueStrip />}

          {/* Features — shown immediately, no stagger */}
          <ul className="space-y-3">
            {product.features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-3 text-sm text-cream-dim"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c85b3a]/10">
                  <Check className="h-3 w-3 text-[#c85b3a]" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA — static, no bouncing arrow */}
          <Button
            className={`w-full transition-all duration-300 ${
              isBundle
                ? "bg-gradient-to-r from-amber to-amber-dim hover:from-amber-dim hover:to-amber text-obsidian font-bold"
                : ""
            }`}
            size="lg"
            variant="default"
            onClick={() => onPurchase?.(product.key)}
          >
            <span>
              {isBundle ? "Get the Full Bundle — $99" : `Get ${product.name}`}
            </span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Product Grid ───────────────────────────────────────────────── */
interface ProductGridProps {
  onPurchase?: (productKey: string) => void;
}

export function ProductGrid({ onPurchase }: ProductGridProps) {
  return (
    <section className="py-24" id="products">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section heading — fade-up once */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-[#c85b3a]">
            Study Materials
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-cream sm:text-4xl">
            Everything You Need to Pass the SPI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-cream-dim">
            110-question exams from a 111-question bank, 200+ spaced repetition
            flashcards, 50 Physics Pearls, and 159 pages of study notes — all
            written by a credentialed RDMS instructor. Start with a free demo.
            Upgrade when you're ready.
          </p>
        </motion.div>

        {/* Introductory pricing banner — fade-up once */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 mx-auto max-w-2xl flex items-center justify-center gap-3 rounded-xl border border-[#c85b3a]/15 bg-[#c85b3a]/[0.04] px-5 py-3"
        >
          <Zap className="h-4 w-4 text-[#c85b3a] shrink-0" />
          <p className="text-sm text-cream-dim">
            <span className="text-cream font-semibold">
              Introductory pricing
            </span>{" "}
            — SonoPrep is a new platform. These are launch rates. All products
            include a 10-day full refund policy.
          </p>
        </motion.div>

        {/* Card grid — fade-up once per card */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
              className={
                product.key === "PREMIUM_BUNDLE" ? "sm:col-span-2" : ""
              }
            >
              <ProductCard product={product} onPurchase={onPurchase} />
            </motion.div>
          ))}
        </div>

        {/* Trust bar — fade-up once */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10"
        >
          <TrustBar />
        </motion.div>

        {/* Copyright notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-cream-dim/30">
            All content is original, proprietary, and copyright protected.
            SonoPrep is not affiliated with ARDMS. SPI® is a registered
            trademark of the American Registry for Diagnostic Medical
            Sonography.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
