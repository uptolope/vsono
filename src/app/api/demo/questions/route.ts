import { NextResponse } from "next/server";
import { DEMO_QUESTIONS, DEMO_QUESTIONS_PER_ATTEMPT } from "../../../../lib/demo/exam-data";

export async function GET() {
  try {
    // Full 10-question authoritative demo set. Order is randomized once
    // per attempt on the client (see src/lib/demo/demo-attempt.ts) and
    // persisted there — this route always returns the same base set.
    return NextResponse.json({
      questions: DEMO_QUESTIONS.slice(0, DEMO_QUESTIONS_PER_ATTEMPT),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load demo questions" },
      { status: 500 }
    );
  }
}
