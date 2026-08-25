"use client";

import { useState } from "react";
import type { DemoFlashcard } from "@/lib/demo/flashcard-data";

interface FlashcardViewerProps {
  cards: DemoFlashcard[];
}

const CATEGORY_LABELS: Record<string, string> = {
  physics: "Physics Fundamentals",
  transducers: "Transducer Technology",
  doppler: "Doppler & Hemodynamics",
  artifacts: "Image Artifacts",
  safety: "Bioeffects & Safety",
};

export function FlashcardViewer({ cards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const card = cards[currentIndex];
  const total = cards.length;
  const knownCount = known.size;

  const advance = (markKnown: boolean) => {
    if (markKnown) {
      setKnown((prev) => new Set(prev).add(card.id));
    }
    setFlipped(false);
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  };

  return (
    <div className="depth-border corner-arch p-8">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="meta text-[10px] text-[#4a453f]">
          CARD {currentIndex + 1} OF {total}
        </span>
        <span className="meta text-[9px] text-[#4a453f]">
          {knownCount} MARKED KNOWN
        </span>
      </div>
      <div className="h-1 bg-white/5 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-[#c85b3a] rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Category tag */}
      <p className="meta text-[9px] text-[#c85b3a] mb-4">
        {CATEGORY_LABELS[card.category] ?? card.category}
      </p>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="min-h-[200px] flex flex-col justify-center cursor-pointer select-none mb-6 border border-white/[0.06] rounded p-6 hover:border-[#c85b3a]/20 transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped(!flipped);
          }
        }}
      >
        {!flipped ? (
          <>
            <p className="meta text-[9px] text-[#4a453f] mb-3">QUESTION</p>
            <p className="display-serif text-lg font-semibold text-white leading-relaxed">
              {card.question}
            </p>
            <p className="meta text-[9px] text-[#3a3530] mt-4">
              TAP TO REVEAL ANSWER
            </p>
          </>
        ) : (
          <>
            <p className="meta text-[9px] text-[#c85b3a] mb-3">ANSWER</p>
            <p className="body-readable text-[#c2bab0] text-sm leading-relaxed">
              {card.answer}
            </p>
          </>
        )}
      </div>

      {/* Actions — only visible when flipped */}
      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => advance(false)}
            className="btn-industrial-outline py-3 text-[10px] text-center"
          >
            STILL LEARNING
          </button>
          <button
            onClick={() => advance(true)}
            className="btn-industrial py-3 text-[10px] text-center"
          >
            GOT IT ✓
          </button>
        </div>
      )}

      {/* Not flipped — show a hint */}
      {!flipped && (
        <p className="text-center meta text-[9px] text-[#3a3530] mt-2">
          Click the card to see the answer, then rate yourself
        </p>
      )}
    </div>
  );
}
