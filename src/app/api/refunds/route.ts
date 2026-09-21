import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  getRefundEligibility,
  refundEligibilityMessage,
} from "@/lib/refunds";
import { getStripe } from "@/lib/stripe";

type SessionUser = {
  id?: string;
};

type RefundRequestBody = {
  purchaseId?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser | undefined)?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: RefundRequestBody;

  try {
    body = (await request.json()) as RefundRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const purchaseId =
    typeof body.purchaseId === "string"
      ? body.purchaseId.trim()
      : "";

  if (!purchaseId) {
    return NextResponse.json(
      { error: "purchaseId is required." },
      { status: 400 },
    );
  }

  const eligibility = await getRefundEligibility(
    purchaseId,
    userId,
  );

  if (!eligibility.eligible) {
    return NextResponse.json(
      {
        error: refundEligibilityMessage(eligibility.reason),
        reason: eligibility.reason,
      },
      { status: 400 },
    );
  }

  if (!eligibility.purchase) {
    return NextResponse.json(
      {
        error: "Purchase details were not found.",
        reason: "purchase_not_found",
      },
      { status: 400 },
    );
  }

  const paymentIntentId =
    eligibility.purchase.stripePaymentIntentId;

  if (!paymentIntentId) {
    return NextResponse.json(
      {
        error: "This purchase has no refundable Stripe payment record.",
        reason: "missing_payment_intent",
      },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();

    const refund = await stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
        metadata: {
          purchaseId,
          userId,
          source: "sonoprep-refund-endpoint",
        },
      },
      {
        idempotencyKey: `purchase-refund-${purchaseId}`,
      },
    );

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
      purchaseId,
    });
  } catch (error) {
    console.error(
      `[refunds] Stripe refund failed for purchase ${purchaseId}`,
      error,
    );

    return NextResponse.json(
      {
        error: "The refund could not be processed.",
        reason: "stripe_refund_failed",
      },
      { status: 502 },
    );
  }
}

