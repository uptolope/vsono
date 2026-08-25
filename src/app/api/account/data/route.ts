import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AccountPurchaseInfo } from "@/lib/types/account";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The where clause is hardcoded to the authenticated session's own
  // id — there is no id parameter accepted from the request anywhere
  // in this route, so there's no way to ask for someone else's export.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      purchases: {
        select: {
          Product: { select: { type: true } },
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
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Explicitly map the Prisma relation/column names to the client-facing
  // shape defined in AccountPurchaseInfo. `Product` can be null if the
  // related row was ever deleted — fall back to a safe label instead of
  // rendering `undefined`/`[object Object]`.
  const purchases: AccountPurchaseInfo[] = user.purchases.map((p) => ({
    product: p.Product?.type ?? "UNKNOWN",
    status: p.status,
    amountPaidCents: p.amountInCents,
    accessGrantedAt: p.accessGrantedAt.toISOString(),
    accessExpiresAt: p.accessExpiresAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }));

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
