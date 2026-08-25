// app/api/flashcards/due/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkContentAccess } from '@/lib/content/access-check';
import { prisma } from '@/lib/prisma';
import { FLASHCARDS } from '@/lib/content/flashcard-data';

export async function GET(req: NextRequest) {
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
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '20', 10), 1), 10000);

    const now = new Date();

    // Fetch user's progress records for cards due for review
    const progressRecords = await prisma.flashcardProgress.findMany({
      where: {
        userId,
        isMastered: false,
        OR: [
          { nextReview: { lte: now } },
          { nextReview: null },
        ],
      },
      select: {
        cardId: true,
        box: true,
        easeFactor: true,
        interval: true,
        repetitions: true,
        reviewCount: true,
        correctCount: true,
        incorrectCount: true,
        lastReviewed: true,
        nextReview: true,
        timeSpentMs: true,
      },
      orderBy: [
        { nextReview: 'asc' },
        { reviewCount: 'asc' },
      ],
      take: limit,
    });

    // Map cardId to static FLASHCARDS data
    const due = progressRecords.map((progress) => {
      const flashcard = FLASHCARDS.find((fc) => fc.id === progress.cardId);
      if (!flashcard) {
        return {
          id: progress.cardId.toString(),
          front: 'Card not found',
          back: 'This card is no longer available',
          accessExpiresAt: access.expiresAt?.toISOString() ?? null,
          progress,
        };
      }

      return {
        id: flashcard.id.toString(),
        front: flashcard.question,
        back: flashcard.answer,
        accessExpiresAt: access.expiresAt?.toISOString() ?? null,
        progress,
      };
    });

    return NextResponse.json({
      success: true,
      due,
      totalDue: due.length,
      limit,
    });
  } catch (error) {
    console.error('[flashcards/due] Error fetching due cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due cards' },
      { status: 500 }
    );
  }
}