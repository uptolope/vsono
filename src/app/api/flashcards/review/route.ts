import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkContentAccess } from '@/lib/content/access-check';
import { prisma } from '@/lib/prisma';
import { calculateNextReview } from '@/lib/spaced-repetition';
import { z } from 'zod';

const reviewSchema = z.object({
  cardId: z.number(),
  quality: z.number().min(0).max(5),
});

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { cardId, quality } = parsed.data;

  try {
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
          correctCount: 0,
          incorrectCount: 0,
        },
      });
    }

    const nextReview = calculateNextReview(
      quality,
      progress.box,
      progress.easeFactor,
      progress.interval
    );

    const updatedProgress = await prisma.flashcardProgress.update({
      where: {
        userId_cardId: {
          userId,
          cardId,
        },
      },
      data: {
        box: nextReview.box,
        easeFactor: nextReview.easeFactor,
        interval: nextReview.interval,
        nextReview: nextReview.nextReview,
        lastReviewed: new Date(),
        repetitions: progress.repetitions + 1,
        reviewCount: progress.reviewCount + 1,
        correctCount: quality >= 3 ? progress.correctCount + 1 : progress.correctCount,
        incorrectCount: quality < 3 ? progress.incorrectCount + 1 : progress.incorrectCount,
        isMastered: nextReview.box === 5,
      },
    });

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('[flashcards/review] Error saving review:', error);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
