// app/api/flashcards/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkContentAccess } from '@/lib/content/access-check';
import { prisma } from '@/lib/prisma';

const QUALITY_MAP: Record<string, number> = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await checkContentAccess(userId, 'FLASHCARDS');
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const { cardId, rating, timeSpentMs = 0 } = await req.json();

    if (!cardId || !rating || !QUALITY_MAP[rating]) {
      return NextResponse.json({ error: 'Invalid cardId or rating' }, { status: 400 });
    }

    const parsedCardId = typeof cardId === 'string' ? parseInt(cardId, 10) : cardId;
    if (isNaN(parsedCardId)) {
      return NextResponse.json({ error: 'Invalid cardId format' }, { status: 400 });
    }

    const quality = QUALITY_MAP[rating];
    const now = new Date();

    // Record the raw review (audit trail)
    await prisma.flashcardReview.create({
      data: {
        userId,
        flashcardId: parsedCardId,
        quality,
        timeSpentMs,
        reviewedAt: now,
      },
    });

    // Get or create progress
    let progress = await prisma.flashcardProgress.findUnique({
      where: { userId_cardId: { userId, cardId: parsedCardId } },
    });

    const isNew = !progress;

    if (isNew) {
      progress = await prisma.flashcardProgress.create({
        data: {
          userId,
          cardId: parsedCardId,
          box: 1,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          reviewCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          isMastered: false,
          nextReview: null,
          lastReviewed: now,
          timeSpentMs: 0,
        },
      });
    }

    // At this point, progress is guaranteed to exist
    if (!progress) {
      throw new Error('Failed to create or fetch progress');
    }

    // Calculate new scheduling values
    const updated = updateFSRSProgress(
      {
        interval: progress.interval,
        easeFactor: progress.easeFactor,
        repetitions: progress.repetitions,
        reviewCount: progress.reviewCount,
        correctCount: progress.correctCount,
        incorrectCount: progress.incorrectCount,
      },
      quality
    );

    const nextReviewDate = new Date(now.getTime() + updated.interval * 86_400_000);

    // Update progress
    const updatedProgress = await prisma.flashcardProgress.update({
      where: { userId_cardId: { userId, cardId: parsedCardId } },
      data: {
        box: quality >= 3 ? Math.min(progress.box + 1, 5) : 1,
        easeFactor: updated.easeFactor,
        interval: updated.interval,
        repetitions: updated.repetitions,
        reviewCount: { increment: 1 },
        correctCount: quality >= 3 ? { increment: 1 } : undefined,
        incorrectCount: quality < 3 ? { increment: 1 } : undefined,
        lastReviewed: now,
        nextReview: nextReviewDate,
        timeSpentMs: { increment: timeSpentMs },
        isMastered: updated.interval > 21 && quality >= 3 && progress.reviewCount + 1 >= 5,
      },
    });

    return NextResponse.json({
      success: true,
      cardId: parsedCardId,
      newInterval: updated.interval,
      newEaseFactor: Number(updated.easeFactor.toFixed(2)),
      nextReview: nextReviewDate.toISOString(),
      isMastered: updatedProgress.isMastered,
      quality,
    });
  } catch (error) {
    console.error('[flashcards/review] Error:', error);
    return NextResponse.json({ error: 'Failed to record review' }, { status: 500 });
  }
}

/**
 * FSRS-inspired update algorithm (simplified but effective)
 */
function updateFSRSProgress(
  current: {
    interval: number;
    easeFactor: number;
    repetitions: number;
    reviewCount: number;
    correctCount: number;
    incorrectCount: number;
  },
  quality: number
) {
  const { interval } = current;
  let { easeFactor, repetitions } = current;

  if (repetitions === 0) {
    return {
      interval: quality >= 3 ? 1 : 0,
      easeFactor: Math.max(1.3, easeFactor + (quality - 3) * 0.1),
      repetitions: 1,
    };
  }

  repetitions += 1;

  if (quality === 1) {
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (quality === 2) {
    easeFactor = Math.max(1.3, easeFactor - 0.1);
  } else if (quality === 4) {
    easeFactor = Math.min(3.5, easeFactor + 0.15);
  }

  let newInterval: number;

  if (quality === 1) {
    newInterval = 0;
  } else if (quality === 2) {
    newInterval = Math.max(1, Math.floor(interval * 0.6));
  } else {
    const multiplier = quality === 4 ? 2.5 : 1.8;
    newInterval = Math.max(1, Math.floor(interval * multiplier * (easeFactor / 2.5)));
  }

  if (newInterval > 0 && newInterval <= interval) {
    newInterval = interval + 1;
  }

  return {
    interval: newInterval,
    easeFactor: Math.max(1.3, Math.min(4.0, easeFactor)),
    repetitions,
  };
}
