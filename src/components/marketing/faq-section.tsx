"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FAQS } from "@/lib/faq-data";

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const answerId = `faq-answer-\${index}`;
  const buttonId = `faq-button-\${index}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      className="border-b border-border/50 last:border-0"
    >
      <button
        id={buttonId}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={answerId}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="display-serif font-semibold text-white leading-snug">
          {q}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-5 w-5 shrink-0 text-[#c85b3a]/60 transition-transform duration-300 mt-0.5",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id={answerId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
      >
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="pb-5"
          >
            <p className="t-body text-sm text-[#B8B0A6] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function FaqSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <p className="t-caption text-[11px] mb-4">Common Questions</p>
          <h2 className="t-heading text-4xl sm:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div>
          {FAQS.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
