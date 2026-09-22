import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkContentAccess } from '@/lib/content/access-check';
import { prisma } from '@/lib/prisma';
import { calculateNextReview } from '@/lib/spaced-repetition';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { difficulty } = await req.json();

    if (!['easy', 'difficult'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty value' },
        { status: 400 }
      );
    }

    const cardId = parseInt((await params).id, 10);
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      );
    }

    const isCorrect = difficulty === 'easy';

    let progress = await prisma.flashcardProgress.findUnique({
      where: {
        userId_cardId: {
          userId,
          cardId,
        },
      },
    });

    if (!progress) {
      progress = await prisma.flashcardProgress.create({
        data: {
          userId,
          cardId,
          box: 1,
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          reviewCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          isMastered: false,
          timeSpentMs: 0,
        },
      });
    }

    const now = new Date();
    const reviewResult = calculateNextReview({
      box: progress.box,
      easeFactor: progress.easeFactor,
      interval: progress.interval,
      repetitions: progress.repetitions,
      isCorrect,
    });

    const nextReviewDate = new Date(now.getTime() + reviewResult.interval * 24 * 60 * 60 * 1000);

    const updatedProgress = await prisma.flashcardProgress.update({
      where: {
        userId_cardId: {
          userId,
          cardId,
        },
      },
      data: {
        reviewCount: progress.reviewCount + 1,
        correctCount: isCorrect ? progress.correctCount + 1 : progress.correctCount,
        incorrectCount: !isCorrect ? progress.incorrectCount + 1 : progress.incorrectCount,
        lastReviewed: now,
        nextReview: nextReviewDate,
        box: reviewResult.box,
        easeFactor: reviewResult.easeFactor,
        interval: reviewResult.interval,
        repetitions: progress.repetitions + 1,
        isMastered: reviewResult.isMastered,
      },
    });

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('[flashcards/[id]/review] Error:', error);
    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    );
  }
}
