import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/site-url";
import { getPriceEntry, getStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validations";
import { mutationLimiter, checkRateLimit } from "@/lib/server-ratelimit";
import { checkIdempotency } from "@/lib/idempotency";

export const runtime = "nodejs";

/**
 * Creates a Stripe Checkout Session for one product.
 *
 * - The client sends ONLY a product key. The price comes from server-side
 *   configuration (PRODUCT_PRICE_MAP), never from the request.
 * - Session metadata (userId / productId / product / stackAfter) is what the
 *   Stripe webhook uses to fulfil the purchase and compute the access window
 *   (30 days individual, 45 days Premium Bundle — see src/lib/access-durations).
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate. A real user id is required — the webhook fulfils by id.
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string | null } | undefined)?.id;

    if (!session?.user || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate input.
    const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }

    const productKey = parsed.data.product;

    // 3. Abuse protection. Redis (Upstash) backs both guards; if it is
    //    unreachable or unconfigured we fail OPEN rather than block paying
    //    customers — Stripe itself is the backstop for session creation.
    try {
      const rateCheck = await checkRateLimit(
        mutationLimiter,
        `user:${userId}:checkout`,
      );

      if (!rateCheck.success) {
        return rateCheck.response!;
      }

      const isUnique = await checkIdempotency(`checkout-lock:${userId}`, 10);

      if (!isUnique) {
        return NextResponse.json(
          {
            error:
              "A checkout request is already in progress. Please wait a moment.",
          },
          { status: 429 },
        );
      }
    } catch (error) {
      console.warn("[checkout] Rate-limit/lock backend unavailable:", error);
    }

    // 4. Resolve the product + price server-side.
    const product = await prisma.product.findUnique({
      where: { type: productKey },
      select: { id: true, type: true, active: true },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { error: "This product is not currently available." },
        { status: 404 },
      );
    }

    const { priceId } = getPriceEntry(productKey);

    // 5. Don't sell something the customer already has access to, and don't
    //    let an active purchase's remaining days be silently wasted.
    const now = new Date();
    const activePurchases = await prisma.purchase.findMany({
      where: {
        userId,
        status: "COMPLETED",
        accessExpiresAt: { gt: now },
      },
      select: {
        accessExpiresAt: true,
        product: { select: { type: true } },
      },
    });

    const hasActiveBundle = activePurchases.some(
      (p) => p.product.type === "PREMIUM_BUNDLE",
    );

    if (hasActiveBundle && productKey !== "PREMIUM_BUNDLE") {
      return NextResponse.json(
        {
          error:
            "Your active Premium Bundle already includes this product.",
        },
        { status: 409 },
      );
    }

    // Re-buying the same product while it's still active queues the new
    // window after the current one ends, so no paid days are lost.
    const latestSameProductExpiry = activePurchases
      .filter((p) => p.product.type === productKey)
      .map((p) => p.accessExpiresAt)
      .filter((d): d is Date => d instanceof Date)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    const metadata: Record<string, string> = {
      userId,
      productId: product.id,
      product: product.type,
    };

    if (parsed.data.gaClientId) {
      metadata.ga_client_id = parsed.data.gaClientId;
    }

    if (latestSameProductExpiry) {
      metadata.stackAfter = latestSameProductExpiry.toISOString();
    }

    // 6. Create the Checkout Session.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    });

    const baseUrl = getAppUrl();

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      ...(user?.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : user?.email
          ? { customer_email: user.email }
          : {}),
      metadata,
      payment_intent_data: { metadata },
      success_url: `${baseUrl}/account?purchase=success`,
      cancel_url: `${baseUrl}/products`,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout Error:", error);

    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 },
    );
  }
}
