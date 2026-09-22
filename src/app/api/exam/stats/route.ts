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
        score: true,
        categoryBreakdown: true,
      },
    });

    if (sessions.length === 0) {
      return NextResponse.json({
        totalExams: 0,
        averageScore: 0,
        bestScore: 0,
        domainStats: {},
      });
    }

    const scores = sessions.map((s) => s.score || 0);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);

    const domainStats: Record<string, { correct: number; total: number; percentage: number }> = {};

    for (const session of sessions) {
      const breakdown = session.categoryBreakdown as Record<string, { correct: number; total: number }> | null;
      if (!breakdown) continue;

      for (const [domain, stats] of Object.entries(breakdown)) {
        if (!domainStats[domain]) {
          domainStats[domain] = { correct: 0, total: 0, percentage: 0 };
        }
        domainStats[domain].correct += stats.correct;
        domainStats[domain].total += stats.total;
      }
    }

    for (const domain in domainStats) {
      const stat = domainStats[domain];
      stat.percentage = (stat.correct / stat.total) * 100;
    }

    return NextResponse.json({
      totalExams: sessions.length,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
      domainStats,
    });
  } catch (error) {
    console.error('[exam/stats] Error fetching exam stats:', error);
    return NextResponse.json({ error: 'Failed to fetch exam stats' }, { status: 500 });
  }
}
