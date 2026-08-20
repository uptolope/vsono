import { NextResponse } from "next/server";
import { PRODUCT_PRICE_MAP } from "@/lib/stripe";

// GET only, no request body, no query params consulted. This exists so
// the frontend can display which products are currently purchasable
// without hardcoding that list in client bundle. It cannot be used to
// manipulate pricing: it only ever reads PRODUCT_PRICE_MAP and returns
// which keys have a configured price, never accepting client input
// that feeds back into a price or Stripe call.
export async function GET() {
  const available = Object.fromEntries(
    Object.entries(PRODUCT_PRICE_MAP)
      .filter(([, v]) => Boolean(v.priceId))
      .map(([key, v]) => [key, { accessDays: v.accessDays }])
  );

  return NextResponse.json({ products: available });
}
