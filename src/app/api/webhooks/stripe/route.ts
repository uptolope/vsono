import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, PRODUCT_PRICE_MAP } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// 10-day refund window. Refund requests after this are rejected by
// policy, but Stripe disputes can still come through — we handle
// those too (revoke access immediately on any dispute).
const REFUND_WINDOW_DAYS = 10;

// App Router gives us the raw body via req.text() — there is no
// body-parser ordering problem here like there was in Express. But the
// requirement is the same: verify the signature against the RAW text,
// never against a re-serialized JSON.parse(await req.json()) object,
// because re-serialization can change byte-for-byte content and break
// (or worse, silently "fix") the signature check.
export async function POST(req: NextRequest) {
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
    // Signature verification failed. Do not process the payload.
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(checkoutSession);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      await handleRefund(charge);
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      await handleDispute(dispute);
      break;
    }

    default:
      // Unhandled event types are acknowledged but not processed.
      // Returning 200 prevents Stripe from retrying.
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(checkoutSession: Stripe.Checkout.Session) {
  const userId = checkoutSession.metadata?.userId;
  const product = checkoutSession.metadata?.product;

  if (!userId || !product || !(product in PRODUCT_PRICE_MAP)) {
    console.error("Webhook: missing/invalid metadata on session", checkoutSession.id);
    return;
  }

  const now = new Date();
  // Access window is computed HERE, server-side, from our own
  // PRODUCT_PRICE_MAP.accessDays — never from anything in the Stripe
  // payload the client could have influenced, and never from a
  // client request.
  //
  // Stack-time logic: if `stackAfter` is set in metadata, the user
  // already had active access when they repurchased. The new window
  // starts when the old one ends (so they never lose paid days).
  // If `stackAfter` is absent or in the past, window starts now.
  const accessDays = PRODUCT_PRICE_MAP[product].accessDays;
  const stackAfterRaw = checkoutSession.metadata?.stackAfter;
  let windowStart = now;

  if (stackAfterRaw) {
    const stackAfterDate = new Date(stackAfterRaw);
    // Only stack forward if the previous window hasn't already expired
    // between checkout creation and payment completion. If it expired,
    // start from now — the student shouldn't lose time.
    if (stackAfterDate > now) {
      windowStart = stackAfterDate;
    }
  }

  const accessGrantedAt = windowStart;
  const accessExpiresAt = new Date(windowStart.getTime() + accessDays * 24 * 60 * 60 * 1000);

  await prisma.purchase.updateMany({
    where: { stripeCheckoutSessionId: checkoutSession.id },
    data: {
      status: "COMPLETED",
      stripePaymentIntentId:
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id,
      amountPaidCents: checkoutSession.amount_total ?? undefined,
      accessGrantedAt,
      accessExpiresAt,
    },
  });
}

async function handleRefund(charge: Stripe.Charge) {
  // Find the purchase by payment intent ID. A charge.refunded event
  // fires whether the refund is full or partial — we treat both the
  // same way (revoke access) because partial refunds on a one-time
  // product don't make sense for our use case.
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.error("Webhook: refund charge has no payment_intent", charge.id);
    return;
  }

  const purchase = await prisma.purchase.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!purchase) {
    console.error("Webhook: no purchase found for refunded payment_intent", paymentIntentId);
    return;
  }

  // Check refund window — log it but still process (Stripe already
  // processed the refund, so we must revoke access regardless).
  if (purchase.accessGrantedAt) {
    const daysSincePurchase = Math.floor(
      (Date.now() - purchase.accessGrantedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePurchase > REFUND_WINDOW_DAYS) {
      console.warn(
        `Webhook: refund processed ${daysSincePurchase} days after purchase (policy: ${REFUND_WINDOW_DAYS} days)`,
        purchase.id
      );
    }
  }

  // Revoke access immediately on refund.
  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      status: "REFUNDED",
      accessExpiresAt: new Date(), // expires now
    },
  });

  console.log("Webhook: access revoked for refunded purchase", purchase.id);
}

async function handleDispute(dispute: Stripe.Dispute) {
  // Disputes (chargebacks) always revoke access immediately — no
  // grace period, no refund window check. The customer's bank has
  // already pulled the money back.
  const chargeId =
    typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;

  if (!chargeId) {
    console.error("Webhook: dispute has no charge", dispute.id);
    return;
  }

  // We need the payment_intent from the charge to find our purchase.
  // The dispute object may not have it directly, so we fetch the charge.
  let paymentIntentId: string | undefined;
  try {
    const charge = await stripe.charges.retrieve(chargeId);
    paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id ?? undefined;
  } catch (err) {
    console.error("Webhook: failed to retrieve charge for dispute", chargeId, err);
    return;
  }

  if (!paymentIntentId) {
    console.error("Webhook: dispute charge has no payment_intent", chargeId);
    return;
  }

  const purchase = await prisma.purchase.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!purchase) {
    console.error("Webhook: no purchase found for disputed payment_intent", paymentIntentId);
    return;
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      status: "REFUNDED",
      accessExpiresAt: new Date(), // expires now
    },
  });

  console.log("Webhook: access revoked for disputed purchase", purchase.id);
}
