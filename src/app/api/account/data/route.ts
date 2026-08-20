import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
          product: true,
          status: true,
          amountPaidCents: true,
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

  return NextResponse.json({ export: user, exportedAt: new Date().toISOString() });
}
