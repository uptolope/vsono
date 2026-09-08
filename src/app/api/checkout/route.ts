import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ProductType } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { getStripe, PRODUCT_PRICE_MAP } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/site-url";

export async function POST(req: NextRequest): Promise<NextResponse> {
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
  const priceEntry = PRODUCT_PRICE_MAP[product];

  if (!priceEntry?.priceId) {
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
    select: {
      id: true,
      type: true,
      priceInCents: true,
      accessDurationDays: true,
      active: true,
    },
  });

  if (!productRecord || !productRecord.active) {
    return NextResponse.json(
      { error: "Product is not available." },
      { status: 400 }
    );
  }

  /*
   * A Premium Bundle grants access to the individual products.
   * Do not allow a duplicate individual purchase while the bundle
   * is still active.
   */
  if (product !== "PREMIUM_BUNDLE") {
    const activeBundlePurchase = await prisma.purchase.findFirst({
      where: {
        userId,
        product: {
          type: "PREMIUM_BUNDLE",
        },
        status: "COMPLETED",
        accessExpiresAt: {
          gt: new Date(),
        },
      },
      select: {
        accessExpiresAt: true,
      },
    });

    if (activeBundlePurchase?.accessExpiresAt) {
      return NextResponse.json(
        {
          error: `Your Premium Bundle already includes this product. Access is available until ${activeBundlePurchase.accessExpiresAt.toLocaleDateString(
            "en-US",
            {
              month: "long",
              day: "numeric",
              year: "numeric",
            }
          )}. No need to purchase separately.`,
          activeUntil: activeBundlePurchase.accessExpiresAt.toISOString(),
        },
        { status: 409 }
      );
    }
  }

  const latestActivePurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      productId: productRecord.id,
      status: "COMPLETED",
      accessExpiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      accessExpiresAt: "desc",
    },
    select: {
      accessExpiresAt: true,
    },
  });

  const stackAfter =
    latestActivePurchase?.accessExpiresAt?.toISOString() ?? undefined;

  const stripe = getStripe();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: priceEntry.priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      productId: productRecord.id,
      product: productRecord.type,
      ...(stackAfter ? { stackAfter } : {}),
    },
    success_url: `${getAppUrl()}/account?purchase=success`,
    cancel_url: `${getAppUrl()}/products?purchase=cancelled`,
  });

  /*
   * This record remains PENDING until the verified Stripe webhook
   * confirms that the Checkout Session was paid.
   *
   * Do not set accessExpiresAt here. Access is granted only by the
   * webhook.
   */
  await prisma.purchase.create({
    data: {
      userId,
      productId: productRecord.id,
      status: "PENDING",
      stripeSessionId: checkoutSession.id,
      amountInCents: productRecord.priceInCents,
      currency: "usd",
    },
  });

  return NextResponse.json({
    url: checkoutSession.url,
  });
}