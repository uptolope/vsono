import { randomUUID } from "node:crypto";
import type { PurchaseStatus, ProductType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

export function signInAs(userId: string | null): void {
  (globalThis as { __testSession?: { userId: string | null } }).__testSession!.userId =
    userId;
}

export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE "ExamAnswer", "ExamSession", "Review", "Purchase", "Product",
              "subscribers", "DemoLead", "rate_limit_buckets", "User" CASCADE`,
  );
}

export async function createUser(email = `${randomUUID()}@example.test`) {
  return prisma.user.create({ data: { email } });
}

export async function ensureProduct(type: ProductType) {
  return prisma.product.upsert({
    where: { type },
    update: {},
    create: {
      id: `prod_${type.toLowerCase()}`,
      type,
      name: type,
      description: type,
      priceInCents: 1900,
    },
  });
}

/** A purchase row as the Stripe webhook would leave it. No Stripe call is made. */
export async function createPurchase(
  userId: string,
  options: {
    type?: ProductType;
    status?: PurchaseStatus;
    grantedDaysAgo?: number;
    expiresInDays?: number;
  } = {},
) {
  const {
    type = "EXAM_SIMULATOR",
    status = "COMPLETED",
    grantedDaysAgo = 1,
    expiresInDays = 29,
  } = options;

  const product = await ensureProduct(type);

  return prisma.purchase.create({
    data: {
      userId,
      productId: product.id,
      status,
      amountInCents: product.priceInCents,
      accessGrantedAt: new Date(Date.now() - grantedDaysAgo * DAY_MS),
      accessExpiresAt: new Date(Date.now() + expiresInDays * DAY_MS),
    },
  });
}
