import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, PRODUCT_PRICE_MAP } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validate webhook secret at startup
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set");
}

const REFUND_WINDOW_DAYS = 10;

const checkoutMetadataSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  product: z.string().min(1, "product is required"),
  stackAfter: z.string().datetime().optional(),
});

function extractPaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null | undefined
): string | undefined {
  if (typeof paymentIntent === "string") return paymentIntent;
  if (paymentIntent && typeof paymentIntent === "object" && "id" in paymentIntent) {
    return (paymentIntent as Stripe.PaymentIntent).id;
  }
  return undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Stripe signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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
        await handleDispute(dispute, eventId);
        break;
      }

      default:
        console.info(`[webhook:\${eventId}] Unhandled event type: \${event.type}`);
        break;
    }
  } catch (err) {
    console.error(`[webhook:\${eventId}] Error processing event:`, err);
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
  const existingPurchase = await prisma.purchase.findFirst({
    where: { stripeSessionId: checkoutSession.id },
  });

  if (existingPurchase?.status === "COMPLETED") {
    console.info(
      `[webhook:\${eventId}] Checkout already processed, skipping: \${checkoutSession.id}`
    );
    return;
  }

  const metadataResult = checkoutMetadataSchema.safeParse(
    checkoutSession.metadata
  );
  if (!metadataResult.success) {
    console.error(
      `[webhook:\${eventId}] Invalid metadata on session \${checkoutSession.id}:`,
      metadataResult.error.flatten()
    );
    return;
  }

  const { userId, product, stackAfter } = metadataResult.data;

  if (!(product in PRODUCT_PRICE_MAP)) {
    console.error(
      `[webhook:\${eventId}] Unknown product in metadata: \${product}`
    );
    return;
  }

  const now = new Date();
  const accessDays = (PRODUCT_PRICE_MAP[product as keyof typeof PRODUCT_PRICE_MAP]).accessDays;
  let windowStart = now;

  if (stackAfter) {
    const stackAfterDate = new Date(stackAfter);
    if (stackAfterDate > now) {
      windowStart = stackAfterDate;
    }
  }

  const accessGrantedAt = windowStart;
  const accessExpiresAt = new Date(
    windowStart.getTime() + accessDays * 24 * 60 * 60 * 1000
  );

  await prisma.purchase.updateMany({
    where: { stripeSessionId: checkoutSession.id },
    data: {
      status: "COMPLETED",
      stripePaymentIntentId: extractPaymentIntentId(
        checkoutSession.payment_intent
      ),
      amountInCents: checkoutSession.amount_total ?? undefined,
      accessGrantedAt,
      accessExpiresAt,
    },
  });

  console.info(
    `[webhook:\${eventId}] Purchase completed: user \${userId}, product \${product}, expires \${accessExpiresAt.toISOString()}`
  );
}

async function handleRefund(
  charge: Stripe.Charge,
  eventId: string
): Promise<void> {
  const paymentIntentId = extractPaymentIntentId(charge.payment_intent);

  if (!paymentIntentId) {
    console.error(
      `[webhook:\${eventId}] Refund charge has no payment_intent: \${charge.id}`
    );
    return;
  }

  const purchase = await prisma.purchase.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!purchase) {
    console.error(
      `[webhook:\${eventId}] CRITICAL: No purchase found for refunded payment_intent \${paymentIntentId}`
    );
    return;
  }

  if (purchase.accessGrantedAt) {
    const daysSincePurchase = Math.floor(
      (Date.now() - purchase.accessGrantedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePurchase > REFUND_WINDOW_DAYS) {
      console.warn(
        `[webhook:\${eventId}] Refund processed \${daysSincePurchase} days after purchase (policy: \${REFUND_WINDOW_DAYS} days), purchase: \${purchase.id}`
      );
    }
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      status: "REFUNDED",
      accessExpiresAt: new Date(),
    },
  });

  console.info(
    `[webhook:\${eventId}] Access revoked for refunded purchase: \${purchase.id}`
  );
}

async function handleDispute(
  dispute: Stripe.Dispute,
  eventId: string
): Promise<void> {
  const chargeId =
    typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;

  if (!chargeId) {
    console.error(`[webhook:\${eventId}] Dispute has no charge: \${dispute.id}`);
    return;
  }

  let paymentIntentId: string | undefined;
  try {
    const charge = await stripe.charges.retrieve(chargeId);
    paymentIntentId = extractPaymentIntentId(charge.payment_intent);
  } catch (err) {
    console.error(
      `[webhook:\${eventId}] Failed to retrieve charge for dispute \${chargeId}:`,
      err
    );
    throw err;
  }

  if (!paymentIntentId) {
    console.error(
      `[webhook:\${eventId}] Disputed charge has no payment_intent: \${chargeId}`
    );
    return;
  }

  const purchase = await prisma.purchase.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!purchase) {
    console.error(
      `[webhook:\${eventId}] CRITICAL: No purchase found for disputed payment_intent \${paymentIntentId}`
    );
    return;
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      status: "REFUNDED",
      accessExpiresAt: new Date(),
    },
  });

  console.info(
    `[webhook:\${eventId}] Access revoked for disputed purchase: \${purchase.id}`
  );
}