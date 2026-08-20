// ═══════════════════════════════════════════════════════════════════
// SonoPrep — Content Access Verification (SERVER-SIDE ONLY)
// Checks if a user has purchased and has active access to a product.
// MUST be called on every content API route before serving content —
// see src/app/api/content/[product]/route.ts for the enforcement point.
// ═══════════════════════════════════════════════════════════════════

import { prisma } from "@/lib/prisma";
import { BUNDLE_INCLUDES, type ProductContentKey } from "./index";

export interface AccessResult {
  hasAccess: boolean;
  expiresAt?: Date;
  daysRemaining?: number;
  reason?: string;
}

export async function checkContentAccess(
  userId: string,
  productKey: ProductContentKey
): Promise<AccessResult> {
  if (!userId || !productKey) {
    return { hasAccess: false, reason: "Missing user or product" };
  }

  const now = new Date();

  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      status: "COMPLETED",
      accessExpiresAt: { gt: now },
    },
  });

  if (purchases.length === 0) {
    return { hasAccess: false, reason: "No active purchases" };
  }

  const directPurchase = purchases.find((p: { product: string }) => p.product === productKey);
  const relevant =
    directPurchase ??
    (BUNDLE_INCLUDES.includes(productKey)
      ? purchases.find((p: { product: string }) => p.product === "PREMIUM_BUNDLE")
      : undefined);

  if (!relevant || !relevant.accessExpiresAt) {
    return { hasAccess: false, reason: "Product not purchased or expired" };
  }

  const daysRemaining = Math.ceil(
    (relevant.accessExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { hasAccess: true, expiresAt: relevant.accessExpiresAt, daysRemaining };
}

export async function getUserProductAccess(userId: string): Promise<Record<string, AccessResult>> {
  const products: ProductContentKey[] = [
    "FLASHCARDS",
    "EXAM_SIMULATOR",
    "PHYSICS_PEARLS",
    "STUDY_NOTES",
  ];

  const results: Record<string, AccessResult> = {};
  for (const product of products) {
    results[product] = await checkContentAccess(userId, product);
  }
  return results;
}
