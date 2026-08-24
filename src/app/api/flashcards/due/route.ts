import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkContentAccess } from '@/lib/content/access-check';
import { prisma } from '@/lib/prisma';

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
    const now = new Date();
    const dueCards = await prisma.flashcardProgress.findMany({
      where: {
        userId,
        nextReview: {
          lte: now,
        },
      },
      select: {
        cardId: true,
        box: true,
        easeFactor: true,
        interval: true,
        repetitions: true,
      },
      orderBy: {
        nextReview: 'asc',
      },
      take: 50,
    });

    return NextResponse.json({
      due: dueCards,
      totalDue: dueCards.length,
    });
  } catch (error) {
    console.error('[flashcards/due] Error fetching due cards:', error);
    return NextResponse.json({ error: 'Failed to fetch due cards' }, { status: 500 });
  }
}
