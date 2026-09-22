import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentExams = await prisma.examSession.findMany({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        id: true,
        score: true,
        completedAt: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10,
    });

    const recentFlashcards = await prisma.flashcardProgress.findMany({
      where: {
        userId,
        lastReviewed: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        cardId: true,
        lastReviewed: true,
        isMastered: true,
      },
      orderBy: {
        lastReviewed: 'desc',
      },
      take: 10,
    });

    const activity = [
      ...recentExams.map((e) => ({
        type: 'exam',
        data: e,
        timestamp: e.completedAt,
      })),
      ...recentFlashcards.map((f) => ({
        type: 'flashcard',
        data: f,
        timestamp: f.lastReviewed,
      })),
    ].sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0));

    const dailyActivity: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyActivity[dateKey] = 0;
    }

    for (const item of activity) {
      if (item.timestamp) {
        const dateKey = item.timestamp.toISOString().split('T')[0];
        dailyActivity[dateKey] = (dailyActivity[dateKey] ?? 0) + 1;
      }
    }

    return NextResponse.json({
      recentActivity: activity.slice(0, 20),
      dailyActivity,
    });
  } catch (error) {
    console.error('[dashboard/activity] Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
