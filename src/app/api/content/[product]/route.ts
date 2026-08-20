import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContentAccess } from "@/lib/content/access-check";
import {
  FLASHCARDS,
  EXAM_QUESTIONS,
  PHYSICS_PEARLS,
  STUDY_SECTIONS,
  toClientQuestions,
  shuffleQuestions,
  type ProductContentKey,
} from "@/lib/content";

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

  const { product } = await params;
  const productKey = product.toUpperCase() as ProductContentKey;

  if (!VALID_PRODUCTS.includes(productKey)) {
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  const access = await checkContentAccess(userId, productKey);
  if (!access.hasAccess) {
    return NextResponse.json({ error: "Access denied", reason: access.reason }, { status: 403 });
  }

  switch (productKey) {
    case "FLASHCARDS":
      return NextResponse.json({ flashcards: FLASHCARDS, expiresAt: access.expiresAt });

    case "EXAM_SIMULATOR": {
      // correctAnswer and explanation MUST NOT reach the client before
      // submission — toClientQuestions() strips them. Do not bypass
      // this by returning EXAM_QUESTIONS directly.
      const shuffled = shuffleQuestions(EXAM_QUESTIONS);
      return NextResponse.json({
        questions: toClientQuestions(shuffled.slice(0, 110)),
        expiresAt: access.expiresAt,
      });
    }

    case "PHYSICS_PEARLS":
      return NextResponse.json({ pearls: PHYSICS_PEARLS, expiresAt: access.expiresAt });

    case "STUDY_NOTES":
      return NextResponse.json({ sections: STUDY_SECTIONS, expiresAt: access.expiresAt });
  }
}
