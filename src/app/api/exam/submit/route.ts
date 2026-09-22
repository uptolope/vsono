import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { checkContentAccess } from "@/lib/content/access-check";
import { EXAM_QUESTIONS } from "@/lib/content";
import { EXAM_ATTEMPT_COOKIE } from "@/lib/content/exam-attempt-cookie";
import { examSubmitSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const access = await checkContentAccess(userId, "EXAM_SIMULATOR");

  if (!access.hasAccess) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = examSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const bank = new Map(EXAM_QUESTIONS.map((question) => [question.id, question]));
  let correct = 0;
  const perDomain: Record<string, { correct: number; total: number }> = {};
  const examAnswersCreateData: Prisma.ExamAnswerUncheckedCreateWithoutExamSessionInput[] =
    [];

  for (const answer of parsed.data.answers) {
    const question = bank.get(answer.id);

    if (!question) {
      continue;
    }

    perDomain[question.domain] ??= {
      correct: 0,
      total: 0,
    };

    perDomain[question.domain].total += 1;

    const isCorrect = answer.selected === question.correctAnswer;

    if (isCorrect) {
      correct += 1;
      perDomain[question.domain].correct += 1;
    }

    examAnswersCreateData.push({
      userId,
      questionId: answer.id,
      selectedIndex: answer.selected,
      isCorrect,
      timeSpentMs: answer.timeSpentMs ?? 0,
    });
  }

  const totalTimeMs = parsed.data.answers.reduce(
    (sum, answer) => sum + (answer.timeSpentMs ?? 0),
    0
  );

  const score =
    parsed.data.answers.length > 0
      ? Math.round((correct / parsed.data.answers.length) * 100)
      : 0;

  try {
    const examSession = await prisma.examSession.create({
      data: {
        userId,
        examType: "SPI",
        totalQuestions: parsed.data.answers.length,
        correctAnswers: correct,
        score,
        timeSpentSecs: Math.round(totalTimeMs / 1000),
        completed: true,
        completedAt: new Date(),
        categoryBreakdown: perDomain,
        examAnswers: {
          create: examAnswersCreateData,
        },
      },
    });

    const response = NextResponse.json({
      sessionId: examSession.id,
      correct,
      total: parsed.data.answers.length,
      score,
      perDomain,
    });

    // The attempt is complete, so clear the persisted question order.
    response.cookies.set(EXAM_ATTEMPT_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("[exam/submit] Error saving exam session:", error);

    return NextResponse.json(
      { error: "Failed to save exam results" },
      { status: 500 }
    );
  }
}