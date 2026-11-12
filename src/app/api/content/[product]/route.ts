import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContentAccess } from "@/lib/content/access-check";
import { rateLimit } from "@/lib/rate-limit";
import {
  FLASHCARDS,
  EXAM_QUESTIONS,
  PHYSICS_PEARLS,
  STUDY_SECTIONS,
  toClientQuestions,
  QUESTIONS_PER_ATTEMPT,
  type ProductContentKey,
} from "@/lib/content";
import {
  LEGACY_EXAM_ATTEMPT_COOKIE,
  startOrResumeAttempt,
} from "@/lib/exam/attempts";

const VALID_PRODUCTS: ProductContentKey[] = [
  "FLASHCARDS",
  "EXAM_SIMULATOR",
  "PHYSICS_PEARLS",
  "STUDY_NOTES",
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ product: string }> }
) {
  const session = await getServerSession(authOptions);

  // IDOR guard: the user id used for the access check comes ONLY from
  // the authenticated session — never from a query param, header, or
  // request body. There is no code path here where a client can pass
  // a different userId and read someone else's content access.
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate-limit: 100 content requests per user per minute
  const limit = await rateLimit(`content:${userId}`, {
    limit: 100,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    console.warn(`[content] Rate limit exceeded for user ${userId}`);
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const { product } = await params;

  // Validate product parameter is a string
  if (typeof product !== "string") {
    console.warn(`[content] Invalid product parameter type: ${typeof product}`);
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const productKey = product.toUpperCase() as ProductContentKey;

  if (!VALID_PRODUCTS.includes(productKey)) {
    console.info(`[content] Unknown product requested: ${product}`);
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  const access = await checkContentAccess(userId, productKey);
  if (!access.hasAccess) {
    console.warn(
      `[content] Access denied for user ${userId}, product ${productKey}: ${access.reason}`
    );
    return NextResponse.json(
      { error: "Access denied", reason: access.reason },
      { status: 403 }
    );
  }

  switch (productKey) {
    case "FLASHCARDS": {
      if (!FLASHCARDS || FLASHCARDS.length === 0) {
        console.error("[content] FLASHCARDS data is missing or empty");
        return NextResponse.json(
          { error: "Content not available" },
          { status: 500 }
        );
      }
      console.info(`[content] Serving FLASHCARDS to user ${userId}`);
      return NextResponse.json({
        flashcards: FLASHCARDS,
        expiresAt: access.expiresAt,
      });
    }

    case "EXAM_SIMULATOR": {
      if (!EXAM_QUESTIONS || EXAM_QUESTIONS.length < QUESTIONS_PER_ATTEMPT) {
        console.error(
          `[content] Only ${EXAM_QUESTIONS?.length ?? 0} exam questions available (expected ${QUESTIONS_PER_ATTEMPT}+)`
        );
        return NextResponse.json(
          { error: "Content not available" },
          { status: 500 }
        );
      }

      // Attempts live in the database (ExamSession), not in a cookie. This
      // either resumes the user's in-progress attempt with its original
      // question order, or starts a new one and uses one of their attempts.
      // See src/lib/exam/attempts.ts for the rules.
      const attempt = await startOrResumeAttempt(userId);

      if (attempt.kind === "no_access") {
        return NextResponse.json(
          { error: "Access denied", reason: "No active purchase for this product" },
          { status: 403 }
        );
      }

      if (attempt.kind === "limit_reached") {
        console.info(`[content] Exam attempt limit reached for user ${userId}`);
        return NextResponse.json(
          {
            error: "Attempt limit reached",
            reason: "attempt_limit",
            attempts: {
              limit: attempt.limit,
              used: attempt.used,
              remaining: attempt.remaining,
            },
          },
          { status: 403 }
        );
      }

      // correctAnswer and explanation MUST NOT reach the client before
      // submission — toClientQuestions() strips them. Do not bypass
      // this by returning EXAM_QUESTIONS directly.
      console.info(
        `[content] EXAM_SIMULATOR attempt ${attempt.kind} (${attempt.questions.length} questions) for user ${userId}`
      );
      const response = NextResponse.json(
        {
          questions: toClientQuestions(attempt.questions),
          expiresAt: access.expiresAt,
          attempt: {
            number: attempt.attemptNumber,
            resumed: attempt.kind === "resumed",
            startedAt: attempt.startedAt,
            limit: attempt.limit,
            used: attempt.used,
            remaining: attempt.remaining,
          },
        },
        { headers: { "Cache-Control": "no-store" } }
      );
      if (req.cookies.has(LEGACY_EXAM_ATTEMPT_COOKIE)) {
        response.cookies.delete(LEGACY_EXAM_ATTEMPT_COOKIE);
      }
      return response;
    }

    case "PHYSICS_PEARLS": {
      if (!PHYSICS_PEARLS || PHYSICS_PEARLS.length === 0) {
        console.error("[content] PHYSICS_PEARLS data is missing or empty");
        return NextResponse.json(
          { error: "Content not available" },
          { status: 500 }
        );
      }
      console.info(`[content] Serving PHYSICS_PEARLS to user ${userId}`);
      return NextResponse.json({
        pearls: PHYSICS_PEARLS,
        expiresAt: access.expiresAt,
      });
    }

    case "STUDY_NOTES": {
      if (!STUDY_SECTIONS || STUDY_SECTIONS.length === 0) {
        console.error("[content] STUDY_SECTIONS data is missing or empty");
        return NextResponse.json(
          { error: "Content not available" },
          { status: 500 }
        );
      }
      console.info(`[content] Serving STUDY_NOTES to user ${userId}`);
      return NextResponse.json({
        sections: STUDY_SECTIONS,
        expiresAt: access.expiresAt,
      });
    }

    default:
      // This should never happen due to the VALID_PRODUCTS check above,
      // but this is defensive programming.
      console.error(`[content] Unhandled product: ${productKey}`);
      return NextResponse.json(
        { error: "Content handler not implemented" },
        { status: 500 }
      );
  }
}