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
    const sessions = await prisma.examSession.findMany({
      where: {
        userId,
        completed: true,
      },
      select: {
        id: true,
        score: true,
        correctAnswers: true,
        totalQuestions: true,
        timeSpentSecs: true,
        categoryBreakdown: true,
        completedAt: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[exam/history] Error fetching exam history:', error);
    return NextResponse.json({ error: 'Failed to fetch exam history' }, { status: 500 });
  }
}
