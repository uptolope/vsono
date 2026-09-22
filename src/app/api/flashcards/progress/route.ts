import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkContentAccess } from '@/lib/content/access-check';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
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
    const progress = await prisma.flashcardProgress.findMany({
      where: { userId },
      select: {
        cardId: true,
        box: true,
        easeFactor: true,
        interval: true,
        repetitions: true,
        nextReview: true,
        lastReviewed: true,
        isMastered: true,
        reviewCount: true,
        correctCount: true,
        incorrectCount: true,
        timeSpentMs: true,           // Added for consistency with schema
      },
    });

    const now = new Date();
    const totalCards = progress.length;
    const masteredCards = progress.filter((p) => p.isMastered).length;
    const dueForReview = progress.filter((p) => 
      p.nextReview && p.nextReview <= now
    ).length;
    
    const averageEase = totalCards > 0 
      ? progress.reduce((sum, p) => sum + p.easeFactor, 0) / totalCards 
      : 0;
    
    const totalReviews = progress.reduce((sum, p) => sum + p.reviewCount, 0);

    return NextResponse.json({
      progress,
      stats: {
        totalCards,
        masteredCards,
        masteryPercentage: totalCards > 0 ? (masteredCards / totalCards) * 100 : 0,
        dueForReview,
        averageEase: Math.round(averageEase * 100) / 100,
        totalReviews,
      },
    });
  } catch (error) {
    console.error('[flashcards/progress] Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}