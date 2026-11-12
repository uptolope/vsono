import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { EXAM_QUESTIONS, QUESTIONS_PER_ATTEMPT } from "@/lib/content";
import { GET as getContent } from "@/app/api/content/[product]/route";
import { GET as getAttempts } from "@/app/api/exam/attempts/route";
import { POST as submitRoute } from "@/app/api/exam/submit/route";
import {
  ATTEMPT_ACTIVE_MS,
  MAX_EXAM_ATTEMPTS,
  gradeAttempt,
  startOrResumeAttempt,
} from "@/lib/exam/attempts";
import { createPurchase, createUser, resetDatabase, signInAs } from "./helpers/fixtures";

// Everything here runs against the local throwaway database with purchase
// rows written directly — no Stripe call, no payment, no refund.

const byId = new Map(EXAM_QUESTIONS.map((q) => [q.id, q]));

function startExam() {
  return getContent(new NextRequest("http://localhost/api/content/exam_simulator"), {
    params: Promise.resolve({ product: "exam_simulator" }),
  });
}

function submit(body: unknown) {
  return submitRoute(
    new Request("http://localhost/api/exam/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

type ClientQuestion = { id: number; options: string[] };

/** Answers the first `right` questions correctly and the next `wrong` incorrectly. */
function answersFor(questions: ClientQuestion[], right: number, wrong = 0) {
  return questions.slice(0, right + wrong).map((q, i) => {
    const correct = byId.get(q.id)!.correctAnswer;
    return { id: q.id, selected: i < right ? correct : (correct + 1) % q.options.length };
  });
}

async function buyer(options: Parameters<typeof createPurchase>[1] = {}) {
  const user = await createUser();
  const purchase = await createPurchase(user.id, options);
  signInAs(user.id);
  return { user, purchase };
}

beforeEach(async () => {
  await resetDatabase();
  signInAs(null);
});

describe("grading (pure)", () => {
  const questions = EXAM_QUESTIONS.slice(0, 10);

  it("scores only answered questions and breaks the result down by domain", () => {
    const submitted = [
      { id: questions[0].id, selected: questions[0].correctAnswer },
      { id: questions[1].id, selected: questions[1].correctAnswer },
      { id: questions[2].id, selected: (questions[2].correctAnswer + 1) % questions[2].options.length },
    ];

    const graded = gradeAttempt(questions, submitted);

    expect(graded.ok).toBe(true);
    if (!graded.ok) return;

    expect(graded.correct).toBe(2);
    expect(graded.total).toBe(3);
    expect(graded.score).toBe(66.7);
    expect(graded.answers.map((a) => a.isCorrect)).toEqual([true, true, false]);

    const domainTotals = Object.values(graded.perDomain);
    expect(domainTotals.reduce((n, d) => n + d.total, 0)).toBe(3);
    expect(domainTotals.reduce((n, d) => n + d.correct, 0)).toBe(2);
  });

  it("rejects answers to questions outside the attempt, duplicates and impossible choices", () => {
    const outsider = EXAM_QUESTIONS[50];

    expect(gradeAttempt(questions, [{ id: outsider.id, selected: 0 }]).ok).toBe(false);
    expect(
      gradeAttempt(questions, [
        { id: questions[0].id, selected: 0 },
        { id: questions[0].id, selected: 1 },
      ]).ok,
    ).toBe(false);
    expect(
      gradeAttempt(questions, [{ id: questions[0].id, selected: questions[0].options.length }]).ok,
    ).toBe(false);
  });
});

describe("starting an exam", () => {
  it("requires sign-in and a purchase", async () => {
    expect((await startExam()).status).toBe(401);

    const user = await createUser();
    signInAs(user.id);
    expect((await startExam()).status).toBe(403);
    expect(await prisma.examSession.count()).toBe(0);
  });

  it("hands out 110 questions without answers and records attempt 1", async () => {
    const { user, purchase } = await buyer();

    const res = await startExam();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.questions).toHaveLength(QUESTIONS_PER_ATTEMPT);
    expect(new Set(body.questions.map((q: ClientQuestion) => q.id)).size).toBe(QUESTIONS_PER_ATTEMPT);
    expect(JSON.stringify(body)).not.toContain("correctAnswer");
    expect(JSON.stringify(body)).not.toContain("explanation");
    expect(body.attempt).toMatchObject({ number: 1, resumed: false, limit: 3, used: 1, remaining: 2 });

    const rows = await prisma.examSession.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      userId: user.id,
      purchaseId: purchase.id,
      attemptNumber: 1,
      completed: false,
    });
    expect(rows[0].questionIds).toEqual(body.questions.map((q: ClientQuestion) => q.id));
  });

  it("resumes an unfinished attempt with the same questions instead of using another", async () => {
    await buyer();

    const first = await (await startExam()).json();
    const second = await (await startExam()).json();

    expect(second.attempt).toMatchObject({ number: 1, resumed: true, used: 1, remaining: 2 });
    expect(second.attempt.startedAt).toBe(first.attempt.startedAt);
    expect(second.questions.map((q: ClientQuestion) => q.id)).toEqual(
      first.questions.map((q: ClientQuestion) => q.id),
    );
    expect(await prisma.examSession.count()).toBe(1);
  });

  it("opening the exam in several tabs at once uses one attempt", async () => {
    const { user } = await buyer();

    const results = await Promise.all(
      Array.from({ length: 6 }, () => startOrResumeAttempt(user.id)),
    );

    expect(await prisma.examSession.count()).toBe(1);
    expect(results.filter((r) => r.kind === "started")).toHaveLength(1);
    expect(results.filter((r) => r.kind === "resumed")).toHaveLength(5);
  });

  it("an abandoned attempt still counts once it can no longer be resumed", async () => {
    const { user } = await buyer();
    const start = new Date();

    await startOrResumeAttempt(user.id, start);
    const later = new Date(start.getTime() + ATTEMPT_ACTIVE_MS + 1000);
    const next = await startOrResumeAttempt(user.id, later);

    expect(next.kind).toBe("started");
    expect(await prisma.examSession.count()).toBe(2);
  });
});

describe("the three-attempt limit", () => {
  async function takeAttempt() {
    const body = await (await startExam()).json();
    const res = await submit({ answers: answersFor(body.questions, 5, 5) });
    return { start: body, result: await res.json(), status: res.status };
  }

  it("allows exactly three attempts, then refuses a fourth", async () => {
    await buyer();

    for (let n = 1; n <= MAX_EXAM_ATTEMPTS; n += 1) {
      const { start, result, status } = await takeAttempt();

      expect(start.attempt.number).toBe(n);
      expect(status).toBe(200);
      expect(result).toMatchObject({ used: n, remaining: MAX_EXAM_ATTEMPTS - n, limit: 3 });
    }

    const fourth = await startExam();
    const body = await fourth.json();

    expect(fourth.status).toBe(403);
    expect(body.reason).toBe("attempt_limit");
    expect(body.attempts).toEqual({ limit: 3, used: 3, remaining: 0 });
    expect(body.questions).toBeUndefined();
    expect(await prisma.examSession.count()).toBe(3);

    const status = await (await getAttempts()).json();
    expect(status).toMatchObject({ hasAccess: true, limit: 3, used: 3, remaining: 0, active: null });
  });

  it("cannot be bypassed by clearing cookies, hammering the start, or another device", async () => {
    const { user } = await buyer();

    for (let n = 0; n < MAX_EXAM_ATTEMPTS; n += 1) await takeAttempt();

    const results = await Promise.all(
      Array.from({ length: 8 }, () => startOrResumeAttempt(user.id)),
    );

    expect(results.every((r) => r.kind === "limit_reached")).toBe(true);
    expect(await prisma.examSession.count()).toBe(3);
  });

  it("the database itself refuses a fourth attempt row", async () => {
    const { user, purchase } = await buyer();

    await expect(
      prisma.examSession.create({
        data: { userId: user.id, purchaseId: purchase.id, attemptNumber: 4, totalQuestions: 110 },
      }),
    ).rejects.toThrow();
  });

  it("one student's attempts do not affect another's", async () => {
    await buyer();
    for (let n = 0; n < MAX_EXAM_ATTEMPTS; n += 1) await takeAttempt();

    await buyer();
    const body = await (await startExam()).json();

    expect(body.attempt).toMatchObject({ number: 1, used: 1, remaining: 2 });
  });

  it("a new purchase brings three new attempts; the Premium Bundle includes the simulator", async () => {
    const { user } = await buyer();
    for (let n = 0; n < MAX_EXAM_ATTEMPTS; n += 1) await takeAttempt();

    await createPurchase(user.id, { type: "PREMIUM_BUNDLE", expiresInDays: 44 });

    const body = await (await startExam()).json();
    expect(body.attempt).toMatchObject({ number: 1, limit: 6, used: 4, remaining: 2 });
  });

  it("checking the allowance never starts an attempt", async () => {
    await buyer();

    const status = await (await getAttempts()).json();

    expect(status).toMatchObject({ hasAccess: true, limit: 3, used: 0, remaining: 3, active: null });
    expect(await prisma.examSession.count()).toBe(0);
  });
});

describe("POST /api/exam/submit", () => {
  it("requires sign-in", async () => {
    expect((await submit({ answers: [{ id: 1, selected: 0 }] })).status).toBe(401);
  });

  it("grades on the server and saves the session and every answer", async () => {
    const { user } = await buyer();
    const { questions } = await (await startExam()).json();

    const res = await submit({ answers: answersFor(questions, 30, 10) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      correct: 30,
      total: 40,
      score: 75,
      alreadySubmitted: false,
      used: 1,
      remaining: 2,
    });

    const saved = await prisma.examSession.findUniqueOrThrow({
      where: { id: body.sessionId },
      include: { examAnswers: true },
    });

    expect(saved).toMatchObject({
      userId: user.id,
      completed: true,
      correctAnswers: 30,
      totalQuestions: 40,
      score: 75,
    });
    expect(saved.completedAt).toBeInstanceOf(Date);
    expect(saved.categoryBreakdown).toEqual(body.perDomain);
    expect(saved.examAnswers).toHaveLength(40);
    expect(saved.examAnswers.filter((a) => a.isCorrect)).toHaveLength(30);
    expect(saved.examAnswers.every((a) => a.userId === user.id)).toBe(true);
  });

  it("ignores any score or correctness the browser sends", async () => {
    await buyer();
    const { questions } = await (await startExam()).json();

    const answers = answersFor(questions, 0, 10).map((a) => ({ ...a, isCorrect: true }));
    const body = await (await submit({ answers, score: 100, correct: 110 })).json();

    expect(body).toMatchObject({ correct: 0, total: 10, score: 0 });
  });

  it("rejects malformed bodies and answers for questions that were not in the attempt", async () => {
    await buyer();
    const { questions } = await (await startExam()).json();
    const drawn = new Set(questions.map((q: ClientQuestion) => q.id));
    const outsider = EXAM_QUESTIONS.find((q) => !drawn.has(q.id))!;

    expect((await submit("not json")).status).toBe(400);
    expect((await submit({ answers: [] })).status).toBe(400);
    expect((await submit({ answers: [{ id: outsider.id, selected: 0 }] })).status).toBe(400);
    expect(
      (await submit({ answers: [{ id: questions[0].id, selected: 0 }, { id: questions[0].id, selected: 1 }] })).status,
    ).toBe(400);

    // None of that closed the attempt or used another one.
    const rows = await prisma.examSession.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0].completed).toBe(false);
    expect(await prisma.examAnswer.count()).toBe(0);
  });

  it("a double submit saves once and returns the same result", async () => {
    await buyer();
    const { questions } = await (await startExam()).json();
    const payload = { answers: answersFor(questions, 8, 2) };

    const [a, b] = await Promise.all([submit(payload), submit(payload)]);
    const bodies = [await a.json(), await b.json()];

    expect([a.status, b.status]).toEqual([200, 200]);
    expect(bodies.map((x) => x.alreadySubmitted).sort()).toEqual([false, true]);
    expect(bodies[0].sessionId).toBe(bodies[1].sessionId);
    expect(bodies[0].score).toBe(bodies[1].score);

    expect(await prisma.examSession.count()).toBe(1);
    expect(await prisma.examAnswer.count()).toBe(10);

    // A later retry (dropped response) still gets the stored result.
    const again = await (await submit(payload)).json();
    expect(again).toMatchObject({ alreadySubmitted: true, correct: 8, total: 10, used: 1 });
    expect(await prisma.examAnswer.count()).toBe(10);
  });

  it("returns 409 when there is no attempt in progress", async () => {
    await buyer();

    const res = await submit({ answers: [{ id: EXAM_QUESTIONS[0].id, selected: 0 }] });

    expect(res.status).toBe(409);
    expect((await res.json()).reason).toBe("no_active_attempt");
    expect(await prisma.examSession.count()).toBe(0);
  });

  it("cannot submit into another student's attempt", async () => {
    const { user: owner } = await buyer();
    const { questions } = await (await startExam()).json();

    await buyer(); // a different signed-in student with their own purchase
    const res = await submit({ answers: answersFor(questions, 5) });

    expect(res.status).toBe(409);

    const ownersAttempt = await prisma.examSession.findFirstOrThrow({ where: { userId: owner.id } });
    expect(ownersAttempt.completed).toBe(false);
    expect(await prisma.examAnswer.count()).toBe(0);
  });

  it("refuses to grade after the purchase was refunded (simulated, no Stripe call)", async () => {
    const { purchase } = await buyer();
    const { questions } = await (await startExam()).json();

    // Exactly what the Stripe webhook's refund path writes.
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: "REFUNDED", accessExpiresAt: new Date() },
    });

    const res = await submit({ answers: answersFor(questions, 5) });

    expect(res.status).toBe(403);
    expect((await res.json()).reason).toBe("access_revoked");
    expect(await prisma.examAnswer.count()).toBe(0);
    expect((await startExam()).status).toBe(403);
  });

  it("an expired purchase cannot start an exam", async () => {
    await buyer({ grantedDaysAgo: 31, expiresInDays: -1 });

    expect((await startExam()).status).toBe(403);
    expect(await prisma.examSession.count()).toBe(0);
  });

  it("an unpaid (PENDING) purchase grants nothing", async () => {
    await buyer({ status: "PENDING" });

    expect((await startExam()).status).toBe(403);
    expect((await (await getAttempts()).json()).hasAccess).toBe(false);
  });
});
