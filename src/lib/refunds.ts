import type { ProductType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const REFUND_WINDOW_DAYS = 10;

export type RefundEligibilityReason =
  | "eligible"
  | "purchase_not_found"
  | "not_completed"
  | "not_first_purchase"
  | "refund_window_expired"
  | "missing_payment_intent";

export async function getRefundEligibility(
  purchaseId: string,
  userId: string,
) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      id: purchaseId,
      userId,
    },
    select: {
      id: true,
      userId: true,
      productId: true,
      status: true,
      stripePaymentIntentId: true,
      accessGrantedAt: true,
      createdAt: true,
      product: {
        select: {
          type: true,
        },
      },
    },
  });

  if (!purchase) {
    return {
      eligible: false,
      reason: "purchase_not_found" as const,
    };
  }

  if (purchase.status !== "COMPLETED") {
    return {
      eligible: false,
      reason: "not_completed" as const,
      purchase,
    };
  }

  if (!purchase.stripePaymentIntentId) {
    return {
      eligible: false,
      reason: "missing_payment_intent" as const,
      purchase,
    };
  }

  /*
   * Strict overlap rule:
   *
   * - A previous purchase of the same individual product blocks a refund.
   * - A previous Premium Bundle blocks a refund for every included product.
   * - A previous individual product blocks a later Premium Bundle refund.
   * - Expired purchases still count because accessExpiresAt is not checked.
   */
  const earlierProductTypes: ProductType[] =
    purchase.product.type === "PREMIUM_BUNDLE"
      ? [
          "FLASHCARDS",
          "EXAM_SIMULATOR",
          "PHYSICS_PEARLS",
          "STUDY_NOTES",
          "PREMIUM_BUNDLE",
        ]
      : [purchase.product.type, "PREMIUM_BUNDLE"];

  const earlierPurchase = await prisma.purchase.findFirst({
    where: {
      userId: purchase.userId,
      createdAt: {
        lt: purchase.createdAt,
      },
      status: {
        in: ["COMPLETED", "REFUNDED", "DISPUTED"],
      },
      product: {
        type: {
          in: earlierProductTypes,
        },
      },
    },
    select: {
      id: true,
      product: {
        select: {
          type: true,
        },
      },
    },
  });

  if (earlierPurchase) {
    return {
      eligible: false,
      reason: "not_first_purchase" as const,
      purchase,
      earlierPurchase,
    };
  }

  const purchaseStart = purchase.accessGrantedAt ?? purchase.createdAt;

  const refundDeadline = new Date(
    purchaseStart.getTime() +
      REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  if (new Date() > refundDeadline) {
    return {
      eligible: false,
      reason: "refund_window_expired" as const,
      purchase,
      refundDeadline,
    };
  }

  return {
    eligible: true,
    reason: "eligible" as const,
    purchase,
    refundDeadline,
  };
}

export function refundEligibilityMessage(
  reason: RefundEligibilityReason,
): string {
  switch (reason) {
    case "purchase_not_found":
      return "Purchase not found.";

    case "not_completed":
      return "Only completed purchases can be refunded.";

    case "not_first_purchase":
      return (
        "This purchase is not eligible for a refund because the product, " +
        "or access to it through a Premium Bundle, was purchased previously."
      );

    case "refund_window_expired":
      return (
        `Refunds are available only within ${REFUND_WINDOW_DAYS} ` +
        "calendar days of the first eligible purchase."
      );

    case "missing_payment_intent":
      return "This purchase has no refundable Stripe payment record.";

    default:
      return "This purchase is not eligible for a refund.";
  }
}

