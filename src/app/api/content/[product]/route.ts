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
  shuffleQuestions,
  QUESTIONS_PER_ATTEMPT,
  type ProductContentKey,
} from "@/lib/content";
import {
  EXAM_ATTEMPT_COOKIE,
  EXAM_ATTEMPT_COOKIE_MAX_AGE_SECONDS,
  parseExamAttemptCookie,
} from "@/lib/content/exam-attempt-cookie";

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

      const validIds = new Set(EXAM_QUESTIONS.map((q) => q.id));
      const existing = parseExamAttemptCookie(
        req.cookies.get(EXAM_ATTEMPT_COOKIE)?.value,
        validIds,
        QUESTIONS_PER_ATTEMPT
      );

      let orderedQuestions;
      let cookieToSet: string | null = null;

      if (existing) {
        // Active attempt already in progress — reuse its exact order so a
        // refresh, navigation, or review never reshuffles or drops progress.
        const byId = new Map(EXAM_QUESTIONS.map((q) => [q.id, q]));
        orderedQuestions = existing.orderedIds
          .map((id) => byId.get(id))
          .filter((q): q is (typeof EXAM_QUESTIONS)[number] => Boolean(q));
      } else {
        // No active attempt (first load, or the previous one was just
        // submitted and its cookie cleared) — start a fresh randomized one.
        orderedQuestions = shuffleQuestions(EXAM_QUESTIONS).slice(0, QUESTIONS_PER_ATTEMPT);
        cookieToSet = JSON.stringify({
          orderedIds: orderedQuestions.map((q) => q.id),
          startedAt: Date.now(),
        });
      }

      // correctAnswer and explanation MUST NOT reach the client before
      // submission — toClientQuestions() strips them. Do not bypass
      // this by returning EXAM_QUESTIONS directly.
      console.info(
        `[content] Serving EXAM_SIMULATOR (${QUESTIONS_PER_ATTEMPT} of ${EXAM_QUESTIONS.length} questions) to user ${userId}`
      );
      const response = NextResponse.json({
        questions: toClientQuestions(orderedQuestions),
        expiresAt: access.expiresAt,
      });
      if (cookieToSet) {
        response.cookies.set(EXAM_ATTEMPT_COOKIE, cookieToSet, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: EXAM_ATTEMPT_COOKIE_MAX_AGE_SECONDS,
        });
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