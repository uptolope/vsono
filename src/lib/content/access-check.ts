import { prisma } from "@/lib/prisma";
import type { ProductType } from "@prisma/client";

const PRODUCT_TYPE_MAP: Record<string, ProductType> = {
  FLASHCARDS: "FLASHCARDS",
  EXAM_SIMULATOR: "EXAM_SIMULATOR",
  PHYSICS_PEARLS: "PHYSICS_PEARLS",
  STUDY_NOTES: "STUDY_NOTES",
  PREMIUM_BUNDLE: "PREMIUM_BUNDLE",
};

export const checkContentAccess = async (
  userId: string,
  productKey: string
): Promise<{
  hasAccess: boolean;
  reason?: string;
  expiresAt?: Date;
}> => {
  try {
    const productType = PRODUCT_TYPE_MAP[productKey];

    if (!productType) {
      return {
        hasAccess: false,
        reason: "Invalid product type",
      };
    }

    const now = new Date();

    const directPurchase = await prisma.purchase.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        accessExpiresAt: {
          gt: now,
        },
        product: {
          type: productType,
        },
      },
      orderBy: {
        accessExpiresAt: "desc",
      },
      select: {
        accessExpiresAt: true,
      },
    });

    if (directPurchase?.accessExpiresAt) {
      return {
        hasAccess: true,
        expiresAt: directPurchase.accessExpiresAt,
      };
    }

    /*
     * The Premium Bundle grants access to every individual product.
     * A direct Premium Bundle request was already checked above, so this
     * second query is only needed for individual content.
     */
    if (productType !== "PREMIUM_BUNDLE") {
      const bundlePurchase = await prisma.purchase.findFirst({
        where: {
          userId,
          status: "COMPLETED",
          accessExpiresAt: {
            gt: now,
          },
          product: {
            type: "PREMIUM_BUNDLE",
          },
        },
        orderBy: {
          accessExpiresAt: "desc",
        },
        select: {
          accessExpiresAt: true,
        },
      });

      if (bundlePurchase?.accessExpiresAt) {
        return {
          hasAccess: true,
          expiresAt: bundlePurchase.accessExpiresAt,
        };
      }
    }

    return {
      hasAccess: false,
      reason: "No active purchase for this product",
    };
  } catch (error) {
    console.error("[access-check] Error checking access:", error);

    return {
      hasAccess: false,
      reason: "Error checking access",
    };
  }
};