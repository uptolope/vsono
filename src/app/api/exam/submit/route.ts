import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkContentAccess } from '@/lib/content/access-check';
import { EXAM_QUESTIONS } from '@/lib/content';
import { examSubmitSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await checkContentAccess(userId, 'EXAM_SIMULATOR');
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = examSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const bank = new Map(EXAM_QUESTIONS.map((q) => [q.id, q]));
  let correct = 0;
  const perDomain: Record<string, { correct: number; total: number }> = {};
  const examAnswers: Array<{ questionId: number; selectedIndex: number; isCorrect: boolean; timeSpentMs: number }> = [];

  for (const { id, selected, timeSpentMs } of parsed.data.answers) {
    const question = bank.get(id);
    if (!question) continue;

    perDomain[question.domain] ??= { correct: 0, total: 0 };
    perDomain[question.domain].total += 1;

    const isCorrect = selected === question.correctAnswer;
    if (isCorrect) {
      correct += 1;
      perDomain[question.domain].correct += 1;
    }

    examAnswers.push({
      questionId: id,
      selectedIndex: selected,
      isCorrect,
      timeSpentMs: timeSpentMs || 0,
    });
  }

  const totalTime = parsed.data.answers.reduce((sum, a) => sum + (a.timeSpentMs || 0), 0);
  const score = (correct / parsed.data.answers.length) * 100;

  try {
    const examSession = await prisma.examSession.create({
      data: {
        userId,
        examType: 'SPI',
        totalQuestions: parsed.data.answers.length,
        correctAnswers: correct,
        score,
        timeSpentSecs: Math.round(totalTime / 1000),
        completed: true,
        completedAt: new Date(),
        categoryBreakdown: perDomain,
        ExamAnswer: {
          create: examAnswers.map((answer) => ({
            questionId: answer.questionId,
            selectedIndex: answer.selectedIndex,
            isCorrect: answer.isCorrect,
            timeSpentMs: answer.timeSpentMs,
          })),
        },
      },
      include: {
        ExamAnswer: true,
      },
    });

    return NextResponse.json({
      sessionId: examSession.id,
      correct,
      total: parsed.data.answers.length,
      score,
      perDomain,
    });
  } catch (error) {
    console.error('[exam/submit] Error saving exam session:', error);
    return NextResponse.json({ error: 'Failed to save exam results' }, { status: 500 });
  }
}
