import { prisma } from '@/lib/prisma';
import type { ProductType } from '@prisma/client';

const PRODUCT_TYPE_MAP: Record<string, ProductType> = {
  FLASHCARDS: 'FLASHCARDS',
  EXAM_SIMULATOR: 'EXAM_SIMULATOR',
  PHYSICS_PEARLS: 'PHYSICS_PEARLS',
  STUDY_NOTES: 'STUDY_NOTES',
};

export const checkContentAccess = async (
  userId: string,
  productKey: string
): Promise<{ hasAccess: boolean; reason?: string; expiresAt?: Date }> => {
  try {
    const productType = PRODUCT_TYPE_MAP[productKey] as ProductType | undefined;
    if (!productType) {
      return {
        hasAccess: false,
        reason: 'Invalid product type',
      };
    }

    const activePurchase = await prisma.purchase.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        Product: {
          type: productType,
        },
        accessExpiresAt: {
          gt: new Date(),
        },
      },
      select: {
        accessExpiresAt: true,
      },
    });

    if (activePurchase) {
      return {
        hasAccess: true,
        expiresAt: activePurchase.accessExpiresAt,
      };
    }

    if (productType !== 'PREMIUM_BUNDLE') {
      const bundlePurchase = await prisma.purchase.findFirst({
        where: {
          userId,
          status: 'COMPLETED',
          Product: {
            type: 'PREMIUM_BUNDLE',
          },
          accessExpiresAt: {
            gt: new Date(),
          },
        },
        select: {
          accessExpiresAt: true,
        },
      });

      if (bundlePurchase) {
        return {
          hasAccess: true,
          expiresAt: bundlePurchase.accessExpiresAt,
        };
      }
    }

    return {
      hasAccess: false,
      reason: 'No active purchase for this product',
    };
  } catch (error) {
    console.error('[access-check] Error checking access:', error);
    return {
      hasAccess: false,
      reason: 'Error checking access',
    };
  }
};
