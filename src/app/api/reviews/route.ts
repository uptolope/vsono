import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(20).max(1000),
  displayName: z.string().trim().min(1).max(80).optional(),
});

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: {
      status: "APPROVED",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      rating: true,
      body: true,
      displayName: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "You must be signed in to leave a review." },
      { status: 401 },
    );
  }

  const paidPurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      status: "COMPLETED",
      accessGrantedAt: {
        not: null,
      },
    },
    select: {
      id: true,
    },
  });

  if (!paidPurchase) {
    return NextResponse.json(
      { error: "Only verified purchasers can leave a review." },
      { status: 403 },
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (existingReview) {
    return NextResponse.json(
      { error: "You have already submitted a review." },
      { status: 409 },
    );
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Please choose a rating and write a review between 20 and 1,000 characters.",
      },
      { status: 400 },
    );
  }

  const review = await prisma.review.create({
    data: {
      userId,
      rating: parsed.data.rating,
      body: parsed.data.body,
      displayName: parsed.data.displayName || null,
      status: "PENDING",
    },
    select: {
      id: true,
      status: true,
    },
  });

  return NextResponse.json(
    {
      message: "Thanks! Your review was submitted for approval.",
      review,
    },
    { status: 201 },
  );
}
