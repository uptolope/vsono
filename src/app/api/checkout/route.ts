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

  // The ONLY thing the client controls is which product key it wants.
  // The price comes exclusively from PRODUCT_PRICE_MAP, server-side.
  // There is no code path here where a client-supplied amount, price
  // ID, or currency ever reaches the Stripe API call below.
  const { product } = parsed.data;
  const entry = PRODUCT_PRICE_MAP[product];

  if (!entry || !entry.priceId) {
    return NextResponse.json(
      { error: "Product is not currently available for purchase." },
      { status: 400 }
    );
  }

  // ── Repurchase: stack time ──────────────────────────────────
  // If the user already has active access to this product, they can
  // still repurchase — the new access window will start when the
  // current one ends (stacked, not overlapping). We record this
  // intent in metadata so the webhook can compute the correct
  // accessGrantedAt / accessExpiresAt.
  //
  // If buying an individual product, also check if the Premium Bundle
  // already covers it — no need to pay separately.
  if (product !== "PREMIUM_BUNDLE") {
    const activeBundlePurchase = await prisma.purchase.findFirst({
      where: {
        userId,
        product: "PREMIUM_BUNDLE",
        status: "COMPLETED",
        accessExpiresAt: { gt: new Date() },
      },
    });

    if (activeBundlePurchase) {
      const expiresAt = activeBundlePurchase.accessExpiresAt!;
      return NextResponse.json(
        {
          error: `Your Premium Bundle already includes this product (access until ${expiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}). No need to purchase separately.`,
          activeUntil: expiresAt.toISOString(),
        },
        { status: 409 }
      );
    }
  }

  // Find the latest active access for this product — if one exists,
  // the webhook will stack the new window after it.
  const latestActivePurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      product: product as any,
      status: "COMPLETED",
      accessExpiresAt: { gt: new Date() },
    },
    orderBy: { accessExpiresAt: "desc" },
  });

  const stackAfter = latestActivePurchase?.accessExpiresAt?.toISOString() ?? null;
  // ── End repurchase guard ───────────────────────────────────

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: entry.priceId, quantity: 1 }],
    // metadata is trusted by us, not by the client — we set it here,
    // the webhook reads it back to know who paid for what. The client
    // never gets to write to this session's metadata.
    metadata: { userId, product, ...(stackAfter ? { stackAfter } : {}) },
    success_url: `${process.env.NEXTAUTH_URL}/account?purchase=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/products?purchase=cancelled`,
  });

  // Record a PENDING purchase now so the webhook has a row to update
  // rather than needing to create one — and so we can reconcile
  // abandoned checkouts later.
  await prisma.purchase.create({
    data: {
      userId,
      product,
      status: "PENDING",
      stripeCheckoutSessionId: checkoutSession.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
