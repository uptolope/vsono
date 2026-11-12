import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  EXAM_QUESTIONS,
  QUESTIONS_PER_ATTEMPT,
  shuffleQuestions,
  type ExamQuestion,
} from "@/lib/content";

// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Exam attempts (server-side source of truth)
//
// Rules, as sold on /products and stated in the Terms (section 6) and
// the "Before you begin" dialog:
//
//  - Each purchase that includes the Exam Simulator (the simulator
//    itself or the Premium Bundle) comes with MAX_EXAM_ATTEMPTS attempts.
//  - STARTING an exam uses an attempt, whether or not it is finished.
//  - An unfinished attempt can be resumed (refresh, new tab, another
//    device) for ATTEMPT_ACTIVE_MS after it started. Resuming never
//    uses another attempt and never reshuffles the questions.
//  - Only answered questions count toward the score — the simulator
//    says so on its last question ("N unanswered — only answered
//    questions count toward your score"). Skipped questions are not
//    saved and are not counted as wrong.
//
// An attempt is one ExamSession row: created at start (completed=false),
// graded and closed by submitAttempt(). Nothing here trusts the browser
// for which questions were drawn, how many attempts were used, or how
// long the attempt took.
// ═══════════════════════════════════════════════════════════════════

/**
 * Attempts per purchase. The database enforces the same number with the
 * CHECK constraint ExamSession_attemptNumber_range — change both together
 * (and the customer-facing copy that says "3 attempts").
 */
export const MAX_EXAM_ATTEMPTS = 3;

/** How long an unfinished attempt stays resumable and submittable. */
export const ATTEMPT_ACTIVE_MS = 6 * 60 * 60 * 1000;

/**
 * A repeated submit (double click, retry after a dropped response) inside
 * this window gets the stored result back instead of an error.
 */
export const RESUBMIT_GRACE_MS = 10 * 60 * 1000;

/** Cookie used before attempts were stored in the database. Only ever cleared now. */
export const LEGACY_EXAM_ATTEMPT_COOKIE = "sonoprep_exam_attempt";

const EXAM_PRODUCT_TYPES = ["EXAM_SIMULATOR", "PREMIUM_BUNDLE"] as const;

export interface DomainBreakdown {
  [domain: string]: { correct: number; total: number };
}

export interface SubmittedAnswer {
  id: number;
  selected: number;
  timeSpentMs?: number;
}

export interface AttemptSummary {
  limit: number;
  used: number;
  remaining: number;
}

export interface AttemptStatus extends AttemptSummary {
  hasAccess: boolean;
  active: {
    sessionId: string;
    attemptNumber: number | null;
    startedAt: Date;
    resumableUntil: Date;
  } | null;
}

export interface ExamResult extends AttemptSummary {
  sessionId: string;
  correct: number;
  total: number;
  score: number;
  perDomain: DomainBreakdown;
}

type Db = Prisma.TransactionClient;

interface Entitlement {
  id: string;
  used: number;
}

/** Unexpired, paid purchases that include the simulator; soonest-expiring first. */
async function loadEntitlements(
  db: Db,
  userId: string,
  now: Date,
): Promise<Entitlement[]> {
  const purchases = await db.purchase.findMany({
    where: {
      userId,
      status: "COMPLETED",
      accessExpiresAt: { gt: now },
      product: { type: { in: [...EXAM_PRODUCT_TYPES] } },
    },
    orderBy: [{ accessExpiresAt: "asc" }, { createdAt: "asc" }],
    select: { id: true, _count: { select: { examSessions: true } } },
  });

  return purchases.map((p) => ({ id: p.id, used: p._count.examSessions }));
}

function summarize(entitlements: Entitlement[]): AttemptSummary {
  const limit = entitlements.length * MAX_EXAM_ATTEMPTS;
  const used = entitlements.reduce(
    (sum, e) => sum + Math.min(e.used, MAX_EXAM_ATTEMPTS),
    0,
  );

  return { limit, used, remaining: Math.max(0, limit - used) };
}

async function findActiveAttempt(
  db: Db,
  userId: string,
  purchaseIds: string[],
  now: Date,
) {
  if (purchaseIds.length === 0) return null;

  return db.examSession.findFirst({
    where: {
      userId,
      completed: false,
      purchaseId: { in: purchaseIds },
      startedAt: { gt: new Date(now.getTime() - ATTEMPT_ACTIVE_MS) },
    },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      attemptNumber: true,
      questionIds: true,
      startedAt: true,
    },
  });
}

/** Read-only: how many attempts are left and whether one is in progress. */
export async function getAttemptStatus(
  userId: string,
  now: Date = new Date(),
): Promise<AttemptStatus> {
  const entitlements = await loadEntitlements(prisma, userId, now);
  const active = await findActiveAttempt(
    prisma,
    userId,
    entitlements.map((e) => e.id),
    now,
  );

  return {
    hasAccess: entitlements.length > 0,
    ...summarize(entitlements),
    active: active
      ? {
          sessionId: active.id,
          attemptNumber: active.attemptNumber,
          startedAt: active.startedAt,
          resumableUntil: new Date(
            active.startedAt.getTime() + ATTEMPT_ACTIVE_MS,
          ),
        }
      : null,
  };
}

export type StartAttemptResult =
  | { kind: "no_access" }
  | ({ kind: "limit_reached" } & AttemptSummary)
  | ({
      kind: "started" | "resumed";
      sessionId: string;
      attemptNumber: number | null;
      startedAt: Date;
      questions: ExamQuestion[];
    } & AttemptSummary);

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function questionsFor(ids: number[]): ExamQuestion[] {
  const byId = new Map(EXAM_QUESTIONS.map((q) => [q.id, q]));

  return ids
    .map((id) => byId.get(id))
    .filter((q): q is ExamQuestion => Boolean(q));
}

/**
 * Resumes the caller's in-progress attempt, or starts a new one if they
 * have an attempt left.
 *
 * Concurrency: two simultaneous starts both try to insert the same
 * (purchaseId, attemptNumber). The unique index lets exactly one win; the
 * loser retries and resumes the winner's attempt, so opening the exam in
 * two tabs costs one attempt, not two.
 */
export async function startOrResumeAttempt(
  userId: string,
  now: Date = new Date(),
): Promise<StartAttemptResult> {
  let lastError: unknown;

  for (let tries = 0; tries < 3; tries += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const entitlements = await loadEntitlements(tx, userId, now);

        if (entitlements.length === 0) return { kind: "no_access" as const };

        const active = await findActiveAttempt(
          tx,
          userId,
          entitlements.map((e) => e.id),
          now,
        );

        if (active) {
          return {
            kind: "resumed" as const,
            sessionId: active.id,
            attemptNumber: active.attemptNumber,
            startedAt: active.startedAt,
            questions: questionsFor(active.questionIds),
            ...summarize(entitlements),
          };
        }

        const available = entitlements.find((e) => e.used < MAX_EXAM_ATTEMPTS);

        if (!available) {
          return { kind: "limit_reached" as const, ...summarize(entitlements) };
        }

        const drawn = shuffleQuestions(EXAM_QUESTIONS).slice(
          0,
          QUESTIONS_PER_ATTEMPT,
        );

        const created = await tx.examSession.create({
          data: {
            userId,
            purchaseId: available.id,
            attemptNumber: available.used + 1,
            questionIds: drawn.map((q) => q.id),
            totalQuestions: drawn.length,
            startedAt: now,
          },
          select: { id: true, attemptNumber: true, startedAt: true },
        });

        available.used += 1;

        return {
          kind: "started" as const,
          sessionId: created.id,
          attemptNumber: created.attemptNumber,
          startedAt: created.startedAt,
          questions: drawn,
          ...summarize(entitlements),
        };
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      lastError = error;
    }
  }

  throw lastError;
}

export type GradeResult =
  | { ok: false; error: string }
  | {
      ok: true;
      correct: number;
      total: number;
      score: number;
      perDomain: DomainBreakdown;
      answers: {
        questionId: number;
        selectedIndex: number;
        isCorrect: boolean;
        timeSpentMs: number;
      }[];
    };

/**
 * Pure grading. `questions` is the attempt's own draw. Only answered
 * questions are scored (total = number answered), matching what the
 * simulator tells the student before they submit.
 * Rejects answers for questions that are not part of the attempt.
 */
export function gradeAttempt(
  questions: ExamQuestion[],
  submitted: SubmittedAnswer[],
): GradeResult {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const selectedById = new Map<number, SubmittedAnswer>();

  for (const answer of submitted) {
    const question = byId.get(answer.id);

    if (!question) {
      return { ok: false, error: `Question ${answer.id} is not part of this attempt.` };
    }
    if (selectedById.has(answer.id)) {
      return { ok: false, error: `Question ${answer.id} was answered more than once.` };
    }
    if (
      !Number.isInteger(answer.selected) ||
      answer.selected < 0 ||
      answer.selected >= question.options.length
    ) {
      return { ok: false, error: `Question ${answer.id} has an invalid answer choice.` };
    }

    selectedById.set(answer.id, answer);
  }

  const perDomain: DomainBreakdown = {};
  const answers: Extract<GradeResult, { ok: true }>["answers"] = [];
  let correct = 0;

  for (const question of questions) {
    const answer = selectedById.get(question.id);
    if (!answer) continue;

    const bucket = (perDomain[question.domain] ??= { correct: 0, total: 0 });
    bucket.total += 1;

    const isCorrect = answer.selected === question.correctAnswer;

    if (isCorrect) {
      correct += 1;
      bucket.correct += 1;
    }

    answers.push({
      questionId: question.id,
      selectedIndex: answer.selected,
      isCorrect,
      timeSpentMs: clampInt(answer.timeSpentMs ?? 0, 0, ATTEMPT_ACTIVE_MS),
    });
  }

  const total = answers.length;
  const score = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;

  return { ok: true, correct, total, score, perDomain, answers };
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export type SubmitAttemptResult =
  | { kind: "no_active_attempt" }
  | { kind: "access_revoked" }
  | { kind: "invalid"; error: string }
  | { kind: "graded"; alreadySubmitted: boolean; result: ExamResult };

/**
 * Grades and saves the caller's in-progress attempt.
 *
 * The attempt is identified from the session user alone — the request body
 * carries answers only, so there is no id a client could swap to grade or
 * overwrite someone else's attempt.
 */
export async function submitAttempt(
  userId: string,
  submitted: SubmittedAnswer[],
  now: Date = new Date(),
): Promise<SubmitAttemptResult> {
  const attempt = await prisma.examSession.findFirst({
    where: {
      userId,
      completed: false,
      purchaseId: { not: null },
      startedAt: { gt: new Date(now.getTime() - ATTEMPT_ACTIVE_MS) },
    },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      questionIds: true,
      startedAt: true,
      purchase: { select: { status: true } },
    },
  });

  if (!attempt) {
    const recent = await findRecentlySubmitted(userId, now);

    return recent
      ? { kind: "graded", alreadySubmitted: true, result: recent }
      : { kind: "no_active_attempt" };
  }

  // Access that simply ran out mid-exam still gets its result saved; a
  // refunded or disputed purchase does not.
  if (attempt.purchase?.status !== "COMPLETED") {
    return { kind: "access_revoked" };
  }

  const graded = gradeAttempt(questionsFor(attempt.questionIds), submitted);

  if (!graded.ok) return { kind: "invalid", error: graded.error };

  const timeSpentSecs = clampInt(
    (now.getTime() - attempt.startedAt.getTime()) / 1000,
    0,
    ATTEMPT_ACTIVE_MS / 1000,
  );

  const saved = await prisma.$transaction(async (tx) => {
    // Claim the attempt: only one request can flip completed false -> true.
    const claimed = await tx.examSession.updateMany({
      where: { id: attempt.id, userId, completed: false },
      data: {
        completed: true,
        completedAt: now,
        totalQuestions: graded.total,
        correctAnswers: graded.correct,
        score: graded.score,
        timeSpentSecs,
        categoryBreakdown: graded.perDomain,
      },
    });

    if (claimed.count !== 1) return false;

    if (graded.answers.length > 0) {
      await tx.examAnswer.createMany({
        data: graded.answers.map((a) => ({
          ...a,
          sessionId: attempt.id,
          userId,
        })),
      });
    }

    return true;
  });

  if (!saved) {
    const recent = await findRecentlySubmitted(userId, now);

    return recent
      ? { kind: "graded", alreadySubmitted: true, result: recent }
      : { kind: "no_active_attempt" };
  }

  const summary = summarize(await loadEntitlements(prisma, userId, now));

  return {
    kind: "graded",
    alreadySubmitted: false,
    result: {
      sessionId: attempt.id,
      correct: graded.correct,
      total: graded.total,
      score: graded.score,
      perDomain: graded.perDomain,
      ...summary,
    },
  };
}

async function findRecentlySubmitted(
  userId: string,
  now: Date,
): Promise<ExamResult | null> {
  const session = await prisma.examSession.findFirst({
    where: {
      userId,
      completed: true,
      completedAt: { gt: new Date(now.getTime() - RESUBMIT_GRACE_MS) },
    },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      correctAnswers: true,
      totalQuestions: true,
      score: true,
      categoryBreakdown: true,
    },
  });

  if (!session) return null;

  const summary = summarize(await loadEntitlements(prisma, userId, now));

  return {
    sessionId: session.id,
    correct: session.correctAnswers,
    total: session.totalQuestions,
    score: session.score ?? 0,
    perDomain: (session.categoryBreakdown as DomainBreakdown | null) ?? {},
    ...summary,
  };
}
