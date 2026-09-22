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
    const examSessions = await prisma.examSession.findMany({
      where: {
        userId,
        completed: true,
      },
      select: {
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
    });

    const flashcardProgress = await prisma.flashcardProgress.findMany({
      where: { userId },
      select: {
        box: true,
        easeFactor: true,
        isMastered: true,
        reviewCount: true,
        correctCount: true,
        incorrectCount: true,
      },
    });

    const studyNotes = await prisma.studyNoteProgress.findMany({
      where: { userId },
      select: {
        progress: true,
      },
    });

    const examStats = {
      totalExams: 0,
      averageScore: 0,
      bestScore: 0,
      recentScore: 0,
      improvementTrend: 0,
      domainStats: {} as Record<string, { correct: number; total: number; percentage: number }>,
    };

    if (examSessions.length > 0) {
      const scores = examSessions.map((s) => s.score || 0);
      examStats.totalExams = examSessions.length;
      examStats.averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
      examStats.bestScore = Math.max(...scores);
      examStats.recentScore = scores[0];

      if (scores.length >= 6) {
        const recent3 = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const previous3 = scores.slice(3, 6).reduce((a, b) => a + b, 0) / 3;
        examStats.improvementTrend = Math.round((recent3 - previous3) * 100) / 100;
      }

      const domainMap: Record<string, { correct: number; total: number }> = {};
      for (const session of examSessions) {
        const breakdown = session.categoryBreakdown as Record<string, { correct: number; total: number }> | null;
        if (!breakdown) continue;
        for (const [domain, stats] of Object.entries(breakdown)) {
          if (!domainMap[domain]) {
            domainMap[domain] = { correct: 0, total: 0 };
          }
          domainMap[domain].correct += stats.correct;
          domainMap[domain].total += stats.total;
        }
      }
      for (const domain in domainMap) {
        const stat = domainMap[domain];
        examStats.domainStats[domain] = {
          ...stat,
          percentage: Math.round((stat.correct / stat.total) * 100 * 100) / 100,
        };
      }
    }

    const flashcardStats = {
      totalCards: flashcardProgress.length,
      masteredCards: 0,
      masteryPercentage: 0,
      averageEase: 2.5,
      totalReviews: 0,
      accuracy: 0,
    };

    if (flashcardProgress.length > 0) {
      flashcardStats.masteredCards = flashcardProgress.filter((p) => p.isMastered).length;
      flashcardStats.masteryPercentage = Math.round((flashcardStats.masteredCards / flashcardProgress.length) * 100 * 100) / 100;
      flashcardStats.averageEase = Math.round((flashcardProgress.reduce((sum, p) => sum + p.easeFactor, 0) / flashcardProgress.length) * 100) / 100;
      flashcardStats.totalReviews = flashcardProgress.reduce((sum, p) => sum + p.reviewCount, 0);

      const totalCorrect = flashcardProgress.reduce((sum, p) => sum + p.correctCount, 0);
      const totalReviewed = flashcardProgress.reduce((sum, p) => sum + p.correctCount + p.incorrectCount, 0);
      flashcardStats.accuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100 * 100) / 100 : 0;
    }

    const studyNotesStats = {
      totalChapters: studyNotes.length,
      completedChapters: 0,
      averageProgress: 0,
    };

    if (studyNotes.length > 0) {
      studyNotesStats.completedChapters = studyNotes.filter((n) => n.progress === 100).length;
      studyNotesStats.averageProgress = Math.round((studyNotes.reduce((sum, n) => sum + n.progress, 0) / studyNotes.length) * 100) / 100;
    }

    const readinessScore = Math.round(
      (examStats.averageScore * 0.4 + flashcardStats.accuracy * 0.3 + studyNotesStats.averageProgress * 0.3)
    );

    return NextResponse.json({
      exams: examStats,
      flashcards: flashcardStats,
      studyNotes: studyNotesStats,
      readinessScore,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('[dashboard/stats] Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
