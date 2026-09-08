import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

if (
  !process.env.STRIPE_WEBHOOK_SECRET &&
  process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD
) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set");
}

const REFUND_WINDOW_DAYS = 10;

const checkoutMetadataSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  productId: z.string().min(1, "productId is required"),
  product: z.string().min(1, "product is required"),
  stackAfter: z.string().datetime().optional(),
});

function extractPaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null | undefined
): string | undefined {
  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }

  if (
    paymentIntent &&
    typeof paymentIntent === "object" &&
    "id" in paymentIntent
  ) {
    return (paymentIntent as Stripe.PaymentIntent).id;
  }

  return undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error(
      "[webhook] Stripe signature verification failed:",
      error
    );

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const eventId = event.id;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;

        await handleCheckoutCompleted(checkoutSession, eventId);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        await handleRefund(charge, eventId);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;

        await handleDispute(dispute, eventId, stripe);
        break;
      }

      default:
        console.info(
          `[webhook:${eventId}] Unhandled event type: ${event.type}`
        );
        break;
    }
  } catch (error) {
    console.error(
      `[webhook:${eventId}] Error processing event:`,
      error
    );

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  checkoutSession: Stripe.Checkout.Session,
  eventId: string
): Promise<void> {
  /*
   * checkout.session.completed can be emitted before payment is actually
   * successful for some payment methods. Never grant access unless Stripe
   * says the session is paid.
   */
  if (checkoutSession.payment_status !== "paid") {
    console.warn(
      `[webhook:${eventId}] Checkout session is not paid yet; leaving purchase pending: ${checkoutSession.id}`,
      {
        paymentStatus: checkoutSession.payment_status,
      }
    );

    return;
  }

  const metadataResult = checkoutMetadataSchema.safeParse(
    checkoutSession.metadata
  );

  if (!metadataResult.success) {
    console.error(
      `[webhook:${eventId}] Invalid metadata on session ${checkoutSession.id}:`,
      metadataResult.error.flatten()
    );

    /*
     * Throw so Stripe retries the event instead of receiving a misleading
     * HTTP 200 response for a fulfillment failure.
     */
    throw new Error(
      `Invalid checkout metadata for session ${checkoutSession.id}`
    );
  }

  const { userId, productId, product, stackAfter } =
    metadataResult.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error(
      `Cannot fulfill session ${checkoutSession.id}: user ${userId} does not exist`
    );
  }

  const productRecord = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      type: true,
      accessDurationDays: true,
    },
  });

  if (!productRecord) {
    throw new Error(
      `Cannot fulfill session ${checkoutSession.id}: product ${productId} does not exist`
    );
  }

  if (productRecord.type !== product) {
    throw new Error(
      `Product metadata mismatch for session ${checkoutSession.id}: metadata=${product}, database=${productRecord.type}`
    );
  }

  const paymentIntentId = extractPaymentIntentId(
    checkoutSession.payment_intent
  );

  const now = new Date();

  let accessGrantedAt = now;

  if (stackAfter) {
    const stackAfterDate = new Date(stackAfter);

    if (stackAfterDate > now) {
      accessGrantedAt = stackAfterDate;
    }
  }

  const accessExpiresAt = new Date(
    accessGrantedAt.getTime() +
      productRecord.accessDurationDays * 24 * 60 * 60 * 1000
  );

  /*
   * Upsert makes fulfillment safe if:
   * - the webhook is delivered more than once;
   * - the webhook arrives before the checkout route finishes creating
   *   the pending row;
   * - the existing pending row was not created successfully.
   *
   * stripeSessionId is unique in the Prisma schema.
   */
  const purchase = await prisma.purchase.upsert({
    where: {
      stripeSessionId: checkoutSession.id,
    },
    create: {
      userId,
      productId: productRecord.id,
      status: "COMPLETED",
      stripeSessionId: checkoutSession.id,
      stripePaymentIntentId: paymentIntentId,
      amountInCents: checkoutSession.amount_total ?? 0,
      currency: checkoutSession.currency ?? "usd",
      accessGrantedAt,
      accessExpiresAt,
    },
    update: {
      userId,
      productId: productRecord.id,
      status: "COMPLETED",
      stripePaymentIntentId: paymentIntentId,
      amountInCents: checkoutSession.amount_total ?? undefined,
      currency: checkoutSession.currency ?? undefined,
      accessGrantedAt,
      accessExpiresAt,
    },
  });

  console.info(
    `[webhook:${eventId}] Purchase completed: ${purchase.id}; user=${userId}; product=${product}; expires=${accessExpiresAt.toISOString()}`
  );
}

async function handleRefund(
  charge: Stripe.Charge,
  eventId: string
): Promise<void> {
  const paymentIntentId = extractPaymentIntentId(charge.payment_intent);

  if (!paymentIntentId) {
    console.error(
      `[webhook:${eventId}] Refund charge has no payment_intent: ${charge.id}`
    );

    return;
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      stripePaymentIntentId: paymentIntentId,
    },
  });

  if (!purchase) {
    console.error(
      `[webhook:${eventId}] CRITICAL: No purchase found for refunded payment_intent ${paymentIntentId}`
    );

    /*
     * Throw so Stripe retries. This may become fulfillable if an earlier
     * webhook or database write has not completed yet.
     */
    throw new Error(
      `Purchase not found for refunded payment intent ${paymentIntentId}`
    );
  }

  if (purchase.status === "REFUNDED") {
    console.info(
      `[webhook:${eventId}] Refund already processed; skipping purchase ${purchase.id}`
    );

    return;
  }

  if (purchase.accessGrantedAt) {
    const daysSincePurchase = Math.floor(
      (Date.now() - purchase.accessGrantedAt.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSincePurchase > REFUND_WINDOW_DAYS) {
      console.warn(
        `[webhook:${eventId}] Refund processed ${daysSincePurchase} days after purchase; policy window is ${REFUND_WINDOW_DAYS} days; purchase=${purchase.id}`
      );
    }
  }

  await prisma.purchase.update({
    where: {
      id: purchase.id,
    },
    data: {
      status: "REFUNDED",
      accessExpiresAt: new Date(),
    },
  });

  console.info(
    `[webhook:${eventId}] Access revoked for refunded purchase: ${purchase.id}`
  );
}

async function handleDispute(
  dispute: Stripe.Dispute,
  eventId: string,
  stripe: Stripe
): Promise<void> {
  const chargeId =
    typeof dispute.charge === "string"
      ? dispute.charge
      : dispute.charge?.id;

  if (!chargeId) {
    console.error(
      `[webhook:${eventId}] Dispute has no charge: ${dispute.id}`
    );

    throw new Error(`Dispute ${dispute.id} has no charge`);
  }

  let paymentIntentId: string | undefined;

  try {
    const charge = await stripe.charges.retrieve(chargeId);
    paymentIntentId = extractPaymentIntentId(charge.payment_intent);
  } catch (error) {
    console.error(
      `[webhook:${eventId}] Failed to retrieve charge for dispute ${chargeId}:`,
      error
    );

    throw error;
  }

  if (!paymentIntentId) {
    throw new Error(
      `Disputed charge ${chargeId} has no payment intent`
    );
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      stripePaymentIntentId: paymentIntentId,
    },
  });

  if (!purchase) {
    console.error(
      `[webhook:${eventId}] CRITICAL: No purchase found for disputed payment_intent ${paymentIntentId}`
    );

    throw new Error(
      `Purchase not found for disputed payment intent ${paymentIntentId}`
    );
  }

  if (purchase.status === "DISPUTED") {
    console.info(
      `[webhook:${eventId}] Dispute already processed; skipping purchase ${purchase.id}`
    );

    return;
  }

  await prisma.purchase.update({
    where: {
      id: purchase.id,
    },
    data: {
      status: "DISPUTED",
      accessExpiresAt: new Date(),
    },
  });

  console.info(
    `[webhook:${eventId}] Access revoked for disputed purchase: ${purchase.id}`
  );
}