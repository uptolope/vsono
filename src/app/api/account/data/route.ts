import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AccountPurchaseInfo } from "@/lib/types/account";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      purchases: {
        where: {
          status: "COMPLETED",
          accessExpiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          accessExpiresAt: "desc",
        },
        select: {
          product: {
            select: {
              type: true,
            },
          },
          status: true,
          amountInCents: true,
          accessGrantedAt: true,
          accessExpiresAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Account not found" },
      { status: 404 }
    );
  }

  const purchases: AccountPurchaseInfo[] = user.purchases.flatMap(
    (purchase) => {
      if (
        purchase.accessGrantedAt === null ||
        purchase.accessExpiresAt === null
      ) {
        return [];
      }

      return [
        {
          product: purchase.product.type,
          status: "COMPLETED" as const,
          amountPaidCents: purchase.amountInCents,
          accessGrantedAt:
            purchase.accessGrantedAt?.toISOString() ?? null,
          accessExpiresAt:
            purchase.accessExpiresAt?.toISOString() ?? null,
          createdAt: purchase.createdAt.toISOString(),
        },
      ];
    }
  );

  return NextResponse.json({
    export: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      purchases,
    },
    exportedAt: new Date().toISOString(),
  });
}