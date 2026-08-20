import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContentAccess } from "@/lib/content/access-check";
import { EXAM_QUESTIONS } from "@/lib/content";
import { examSubmitSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await checkContentAccess(userId, "EXAM_SIMULATOR");
  if (!access.hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = examSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const bank = new Map(EXAM_QUESTIONS.map((q) => [q.id, q]));
  let correct = 0;
  const perDomain: Record<string, { correct: number; total: number }> = {};

  for (const { id, selected } of parsed.data.answers) {
    const question = bank.get(id);
    // Ignore ids that don't exist in the real bank — do not trust the
    // client's claim about which questions were even shown.
    if (!question) continue;

    perDomain[question.domain] ??= { correct: 0, total: 0 };
    perDomain[question.domain].total += 1;

    if (selected === question.correctAnswer) {
      correct += 1;
      perDomain[question.domain].correct += 1;
    }
  }

  return NextResponse.json({
    correct,
    total: parsed.data.answers.length,
    perDomain,
  });
}
