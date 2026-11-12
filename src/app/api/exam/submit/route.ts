import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { QUESTIONS_PER_ATTEMPT } from "@/lib/content";
import {
  LEGACY_EXAM_ATTEMPT_COOKIE,
  submitAttempt,
} from "@/lib/exam/attempts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        id: z.number().int().positive(),
        selected: z.number().int().min(0).max(25),
        timeSpentMs: z.number().finite().nonnegative().optional(),
      }),
    )
    .min(1)
    .max(QUESTIONS_PER_ATTEMPT),
});

/**
 * Grades the signed-in user's in-progress exam attempt and saves the result.
 *
 * Body: { answers: [{ id, selected, timeSpentMs? }] } — answers only. Which
 * attempt is being graded, which questions belong to it and how many attempts
 * remain all come from the database (see src/lib/exam/attempts.ts).
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit(`exam-submit:${userId}`, {
      limit: 15,
      windowMs: 60_000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please slow down and try again shortly." },
        { status: 429 },
      );
    }

    const parsed = submitSchema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission. Answer at least one question." },
        { status: 400 },
      );
    }

    const outcome = await submitAttempt(userId, parsed.data.answers);

    switch (outcome.kind) {
      case "invalid":
        return NextResponse.json({ error: outcome.error }, { status: 400 });

      case "access_revoked":
        return NextResponse.json(
          { error: "Access denied", reason: "access_revoked" },
          { status: 403 },
        );

      case "no_active_attempt":
        return NextResponse.json(
          {
            error:
              "No exam attempt is in progress. It may have already been submitted or timed out.",
            reason: "no_active_attempt",
          },
          { status: 409 },
        );

      case "graded": {
        const response = NextResponse.json({
          ...outcome.result,
          alreadySubmitted: outcome.alreadySubmitted,
        });
        response.cookies.delete(LEGACY_EXAM_ATTEMPT_COOKIE);
        return response;
      }
    }
  } catch (error) {
    console.error("[exam/submit] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
