export interface FlashcardReviewResult {
  box: number;
  easeFactor: number;
  interval: number;
  nextReview: Date;
  isMastered: boolean;
}

export function calculateNextReview({
  box: previousBox,
  easeFactor: previousEaseFactor,
  interval: previousInterval,
  repetitions,
  isCorrect,
}: {
  box: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  isCorrect: boolean;
}): FlashcardReviewResult {
  // Convert isCorrect to quality score (0-5)
  // Easy = correct answer (quality 4)
  // Difficult = incorrect answer (quality 1)
  const quality = isCorrect ? 4 : 1;

  let easeFactor = previousEaseFactor;
  let box = previousBox;
  let interval = previousInterval;
  let isMastered = false;

  if (quality < 3) {
    box = 1;
    interval = 1;
  } else {
    easeFactor = Math.max(
      1.3,
      previousEaseFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );

    if (previousBox === 1) {
      box = 2;
      interval = 3;
    } else if (previousBox === 2) {
      box = 3;
      interval = 7;
    } else if (previousBox === 3) {
      box = 4;
      interval = 14;
    } else if (previousBox === 4) {
      box = 5;
      interval = 30;
    } else {
      box = 5;
      interval = Math.ceil(interval * easeFactor);
    }

    // Mastery: box 5 + 5+ repetitions + correct answers
    isMastered = box === 5 && repetitions >= 4 && isCorrect;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    box,
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    nextReview,
    isMastered,
  };
}
