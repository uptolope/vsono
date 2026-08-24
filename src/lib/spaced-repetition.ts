export interface FlashcardReviewResult {
  box: number;
  easeFactor: number;
  interval: number;
  nextReview: Date;
}

export function calculateNextReview(
  quality: number,
  previousBox: number,
  previousEaseFactor: number,
  previousInterval: number
): FlashcardReviewResult {
  let easeFactor = previousEaseFactor;
  let box = previousBox;
  let interval = previousInterval;

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
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    box,
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    nextReview,
  };
}
