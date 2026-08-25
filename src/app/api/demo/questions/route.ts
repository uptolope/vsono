import { NextResponse } from "next/server";
import { DEMO_QUESTIONS } from "../../../../lib/demo/exam-data";

export async function GET() {
  try {
    return NextResponse.json({
      questions: DEMO_QUESTIONS.slice(0, 5),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load demo questions" },
      { status: 500 }
    );
  }
}
