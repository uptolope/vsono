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

    // First-time flashcard access fix: a brand-new entitled user has zero
    // FlashcardProgress rows, so the due-card query below (which only reads
    // existing progress rows) would return nothing. Seed one progress row
    // per card in the bank the first time an entitled user has no rows at
    // all. This is idempotent and safe under concurrent requests:
    //   - createMany({ skipDuplicates: true }) is a single atomic statement
    //     backed by the existing @@unique([userId, cardId]) constraint on
    //     FlashcardProgress, so two simultaneous first page-loads cannot
    //     create duplicate rows for the same card.
    //   - It only runs when the user currently has zero progress rows, so
    //     it never re-seeds or resets progress for returning users.
    //   - Seeded rows use nextReview: null, which the due-card query below
    //     already treats as "due now" (`OR: [{ nextReview: { lte: now } },
    //     { nextReview: null }]`), so newly seeded cards are immediately
    //     returned without any change to that query's semantics.
    if (FLASHCARDS.length > 0) {
      const existingCount = await prisma.flashcardProgress.count({
        where: { userId },
      });

      if (existingCount === 0) {
        await prisma.flashcardProgress.createMany({
          data: FLASHCARDS.map((card) => ({
            userId,
            cardId: card.id,
            box: 1,
            easeFactor: 2.5,
            interval: 1,
            repetitions: 0,
            reviewCount: 0,
            correctCount: 0,
            incorrectCount: 0,
            isMastered: false,
            nextReview: null,
            lastReviewed: null,
            timeSpentMs: 0,
          })),
          skipDuplicates: true,
        });
      }
    }

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