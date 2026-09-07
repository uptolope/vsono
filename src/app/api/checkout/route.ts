import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ProductType } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { getStripe, PRODUCT_PRICE_MAP } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/site-url";

export async function POST(req: NextRequest) {
  const stripe = getStripe();

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { product } = parsed.data;
  const entry = PRODUCT_PRICE_MAP[product];

  if (!entry?.priceId) {
    return NextResponse.json(
      {
        error: "Product is not currently available for purchase.",
      },
      { status: 400 }
    );
  }

  const productRecord = await prisma.product.findUnique({
    where: {
      type: product as ProductType,
    },
  });

  if (!productRecord) {
    return NextResponse.json(
      { error: "Product not found in database." },
      { status: 400 }
    );
  }

  if (product !== "PREMIUM_BUNDLE") {
    const activeBundlePurchase = await prisma.purchase.findFirst({
      where: {
        userId,
        Product: {
          type: "PREMIUM_BUNDLE",
        },
        status: "COMPLETED",
        accessExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (activeBundlePurchase?.accessExpiresAt) {
      const expiresAt = activeBundlePurchase.accessExpiresAt;

      return NextResponse.json(
        {
          error: `Your Premium Bundle already includes this product. Access is available until ${expiresAt.toLocaleDateString(
            "en-US",
            {
              month: "long",
              day: "numeric",
              year: "numeric",
            }
          )}. No need to purchase separately.`,
          activeUntil: expiresAt.toISOString(),
        },
        { status: 409 }
      );
    }
  }

  const latestActivePurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      Product: {
        type: product as ProductType,
      },
      status: "COMPLETED",
      accessExpiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      accessExpiresAt: "desc",
    },
  });

  const stackAfter =
    latestActivePurchase?.accessExpiresAt?.toISOString() ?? null;

  const checkoutSession =
    await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: entry.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        product,
        ...(stackAfter ? { stackAfter } : {}),
      },
      success_url: `${getAppUrl()}/account?purchase=success`,
      cancel_url: `${getAppUrl()}/products?purchase=cancelled`,
    });

  await prisma.purchase.create({
    data: {
      userId,
      productId: productRecord.id,
      status: "PENDING",
      stripeSessionId: checkoutSession.id,
      amountInCents: productRecord.priceInCents,

      // The Stripe webhook is the source of truth and updates this
      // after checkout.session.completed.
      accessExpiresAt: new Date(
        Date.now() + entry.accessDays * 24 * 60 * 60 * 1000
      ),
    },
  });

  return NextResponse.json({
    url: checkoutSession.url,
  });
}