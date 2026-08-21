import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { stripe, PRODUCT_PRICE_MAP } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { product } = parsed.data;
  const entry = PRODUCT_PRICE_MAP[product];

  if (!entry || !entry.priceId) {
    return NextResponse.json(
      { error: "Product is not currently available for purchase." },
      { status: 400 }
    );
  }

  // Fetch the product using the ProductType enum value
  const productRecord = await prisma.product.findUnique({
    where: { type: product as any },
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
        accessExpiresAt: { gt: new Date() },
      },
    });

    if (activeBundlePurchase) {
      const expiresAt = activeBundlePurchase.accessExpiresAt!;
      return NextResponse.json(
        {
          error: `Your Premium Bundle already includes this product (access until \${expiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}). No need to purchase separately.`,
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
        type: product as any,
      },
      status: "COMPLETED",
      accessExpiresAt: { gt: new Date() },
    },
    orderBy: { accessExpiresAt: "desc" },
  });

  const stackAfter = latestActivePurchase?.accessExpiresAt?.toISOString() ?? null;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: entry.priceId, quantity: 1 }],
    metadata: { userId, product, ...(stackAfter ? { stackAfter } : {}) },
    success_url: `\${process.env.NEXTAUTH_URL}/account?purchase=success`,
    cancel_url: `\${process.env.NEXTAUTH_URL}/products?purchase=cancelled`,
  });

  // Use productRecord.id for the connect
  await prisma.purchase.create({
    data: {
      userId,
      productId: productRecord.id,
      status: "PENDING",
      stripeSessionId: checkoutSession.id,
      amountInCents: productRecord.priceInCents,
      accessExpiresAt: new Date(Date.now() + (product === "PREMIUM_BUNDLE" ? 45 : 30) * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}