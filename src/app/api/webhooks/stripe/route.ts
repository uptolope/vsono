import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
    return paymentIntent.id;
  }

  return undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not configured");

    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
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
    /*
     * Idempotency protection prevents the same Stripe event from
     * being processed more than once.
     */
    const existingEvent = await prisma.stripeWebhookEvent.findUnique({
      where: {
        id: eventId,
      },
    });

    if (existingEvent) {
      console.info(`[webhook:${eventId}] Event already processed`);

      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const checkoutSession =
          event.data.object as Stripe.Checkout.Session;

        /*
         * handleCheckoutCompleted checks payment_status === "paid"
         * before granting access.
         */
        await handleCheckoutCompleted(checkoutSession, eventId);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const checkoutSession =
          event.data.object as Stripe.Checkout.Session;

        console.warn(
          `[webhook:${eventId}] Async payment failed for checkout ` +
            `session ${checkoutSession.id}. No access was granted.`,
          {
            paymentStatus: checkoutSession.payment_status,
            paymentIntentId: extractPaymentIntentId(
              checkoutSession.payment_intent
            ),
          }
        );

        /*
         * Do not create or complete a Purchase for a failed payment.
         */
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        await handleRefund(charge, eventId);
        break;
      }

      case "charge.dispute.created":
      case "charge.dispute.updated": {
        const dispute = event.data.object as Stripe.Dispute;

        await handleDispute(dispute, eventId, stripe);
        break;
      }

      case "payment_intent.succeeded": {
        /*
         * Do not fulfill purchases here. Checkout Session events are
         * responsible for fulfillment so purchases are not fulfilled twice.
         */
        console.info(
          `[webhook:${eventId}] PaymentIntent succeeded. ` +
            `Fulfillment is handled by Checkout Session events.`
        );

        break;
      }

      default: {
        console.info(
          `[webhook:${eventId}] Unhandled event type: ${event.type}`
        );

        break;
      }
    }

    /*
     * Record the event only after its processing has completed.
     * If processing fails, Stripe receives HTTP 500 and can retry.
     */
    await prisma.stripeWebhookEvent.create({
      data: {
        id: eventId,
        type: event.type,
      },
    });
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
   * Some payment methods are delayed. Do not grant access until
   * Stripe confirms that the Checkout Session payment is paid.
   */
  if (checkoutSession.payment_status !== "paid") {
    console.warn(
      `[webhook:${eventId}] Checkout session is not paid yet: ` +
        `${checkoutSession.id}`,
      {
        paymentStatus: checkoutSession.payment_status,
      }
    );

    return;
  }

  const metadataResult = checkoutMetadataSchema.safeParse(
    checkoutSession.metadata ?? {}
  );

  if (!metadataResult.success) {
    console.error(
      `[webhook:${eventId}] Invalid metadata on session ` +
        `${checkoutSession.id}:`,
      metadataResult.error.flatten()
    );

    throw new Error(
      `Invalid checkout metadata for session ${checkoutSession.id}`
    );
  }

  const { userId, productId, product, stackAfter } =
    metadataResult.data;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error(
      `Cannot fulfill session ${checkoutSession.id}: ` +
        `user ${userId} does not exist`
    );
  }

  const productRecord = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      type: true,
      accessDurationDays: true,
    },
  });

  if (!productRecord) {
    throw new Error(
      `Cannot fulfill session ${checkoutSession.id}: ` +
        `product ${productId} does not exist`
    );
  }

  if (productRecord.type !== product) {
    throw new Error(
      `Product metadata mismatch for session ${checkoutSession.id}: ` +
        `metadata=${product}, database=${productRecord.type}`
    );
  }

  const paymentIntentId = extractPaymentIntentId(
    checkoutSession.payment_intent
  );

  const now = new Date();
  let accessGrantedAt = now;

  if (stackAfter) {
    const stackAfterDate = new Date(stackAfter);

    if (!Number.isNaN(stackAfterDate.getTime()) && stackAfterDate > now) {
      accessGrantedAt = stackAfterDate;
    }
  }

  const accessExpiresAt = new Date(
    accessGrantedAt.getTime() +
      productRecord.accessDurationDays * 24 * 60 * 60 * 1000
  );

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
    `[webhook:${eventId}] Purchase completed: ${purchase.id}; ` +
      `user=${userId}; product=${product}; ` +
      `expires=${accessExpiresAt.toISOString()}`
  );
}

async function handleRefund(
  charge: Stripe.Charge,
  eventId: string
): Promise<void> {
  const paymentIntentId = extractPaymentIntentId(charge.payment_intent);

  if (!paymentIntentId) {
    console.error(
      `[webhook:${eventId}] Refund charge has no payment_intent: ` +
        `${charge.id}`
    );

    return;
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      stripePaymentIntentId: paymentIntentId,
    },
  });

  if (!purchase) {
    throw new Error(
      `Purchase not found for refunded payment intent ` +
        `${paymentIntentId}`
    );
  }

  if (purchase.status === "REFUNDED") {
    console.info(
      `[webhook:${eventId}] Refund already processed for purchase ` +
        `${purchase.id}`
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
        `[webhook:${eventId}] Refund processed ${daysSincePurchase} ` +
          `days after purchase; refund window is ` +
          `${REFUND_WINDOW_DAYS} days`
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
    `[webhook:${eventId}] Access revoked for refunded purchase ` +
      `${purchase.id}`
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
    throw new Error(`Dispute ${dispute.id} has no charge`);
  }

  const charge = await stripe.charges.retrieve(chargeId);
  const paymentIntentId = extractPaymentIntentId(charge.payment_intent);

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
    throw new Error(
      `Purchase not found for disputed payment intent ` +
        `${paymentIntentId}`
    );
  }

  if (purchase.status === "DISPUTED") {
    console.info(
      `[webhook:${eventI}] Dispute already processed for purchase ` +
        ${purchase.id}`
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
    `[webhook:${eventId}] Access revoked for disputed purchase ` +
      `${purchase.id}`
  );
}