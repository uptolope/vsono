import { NextResponse } from "next/server";
import { DEMO_FLASHCARDS } from "../../../../lib/demo/flashcard-data";

export async function GET() {
  try {
    return NextResponse.json({
      flashcards: DEMO_FLASHCARDS,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load demo flashcards" },
      { status: 500 }
    );
  }
}
