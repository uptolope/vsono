"use client";

import { useEffect, useState } from "react";
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

export function FlashcardViewer({
  cards,
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  /*
   * Keeps the current index valid if the cards array changes,
   * such as when a category filter is applied.
   */
  useEffect(() => {
    setCurrentIndex((previousIndex) => {
      if (cards.length === 0) {
        return 0;
      }

      return Math.min(previousIndex, cards.length - 1);
    });

    setFlipped(false);
  }, [cards.length]);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-white">
        Loading flashcards...
      </div>
    );
  }

  const card = cards[currentIndex];
  const total = cards.length;
  const knownCount = known.size;

  function goToNextCard() {
    setFlipped(false);

    setCurrentIndex((previousIndex) => {
      // Last card → first card
      return (previousIndex + 1) % total;
    });
  }

  function goToPreviousCard() {
    setFlipped(false);

    setCurrentIndex((previousIndex) => {
      // First card → last card
      return (previousIndex - 1 + total) % total;
    });
  }

  function markCardAsKnown() {
    setKnown((previousKnown) => {
      const updatedKnown = new Set(previousKnown);
      updatedKnown.add(card.id);
      return updatedKnown;
    });

    goToNextCard();
  }

  function toggleCard() {
    setFlipped((previousFlipped) => !previousFlipped);
  }

  function handleCardKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCard();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousCard();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextCard();
    }
  }

  return (
    <div className="depth-border corner-arch p-8">
      {/* Progress information */}
      <div className="mb-4 flex items-center justify-between">
        <span className="meta text-[10px] text-[#4a453f]">
          CARD {currentIndex + 1} OF {total}
        </span>

        <span className="meta text-[9px] text-[#4a453f]">
          {knownCount} MARKED KNOWN
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#c85b3a] transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / total) * 100}%`,
          }}
        />
      </div>

      {/* Category tag */}
      <p className="meta mb-4 text-[9px] text-[#c85b3a]">
        {CATEGORY_LABELS[card.category] ?? card.category}
      </p>

      {/* Flashcard */}
      <div
        onClick={toggleCard}
        onKeyDown={handleCardKeyDown}
        className="mb-6 flex min-h-[200px] cursor-pointer select-none flex-col justify-center rounded border border-white/[0.06] p-6 transition-colors hover:border-[#c85b3a]/20"
        role="button"
        tabIndex={0}
        aria-label={
          flipped
            ? "Showing answer. Click to show the question."
            : "Showing question. Click to reveal the answer."
        }
      >
        {!flipped ? (
          <>
            <p className="meta mb-3 text-[9px] text-[#4a453f]">
              QUESTION
            </p>

            <p className="display-serif text-lg font-semibold leading-relaxed text-white">
              {card.question}
            </p>

            <p className="meta mt-4 text-[9px] text-[#3a3530]">
              TAP TO REVEAL ANSWER
            </p>
          </>
        ) : (
          <>
            <p className="meta mb-3 text-[9px] text-[#c85b3a]">
              ANSWER
            </p>

            <p className="body-readable text-sm leading-relaxed text-[#c2bab0]">
              {card.answer}
            </p>
          </>
        )}
      </div>

      {/* Previous and Next navigation */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={goToPreviousCard}
          className="btn-industrial-outline py-3 text-center text-[10px]"
          aria-label="Go to previous flashcard"
        >
          ← PREVIOUS
        </button>

        <button
          type="button"
          onClick={goToNextCard}
          className="btn-industrial-outline py-3 text-center text-[10px]"
          aria-label="Go to next flashcard"
        >
          NEXT →
        </button>
      </div>

      {/* Rating actions — visible after revealing the answer */}
      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={goToNextCard}
            className="btn-industrial-outline py-3 text-center text-[10px]"
          >
            STILL LEARNING
          </button>

          <button
            type="button"
            onClick={markCardAsKnown}
            className="btn-industrial py-3 text-center text-[10px]"
          >
            GOT IT ✓
          </button>
        </div>
      )}

      {/* Hint before revealing */}
      {!flipped && (
        <p className="meta mt-2 text-center text-[9px] text-[#3a3530]">
          Click the card to see the answer, then rate yourself
        </p>
      )}

      {/* Keyboard instructions */}
      <p className="meta mt-4 text-center text-[9px] text-[#4a453f]">
        Use ← and → to move between cards
      </p>
    </div>
  );
}