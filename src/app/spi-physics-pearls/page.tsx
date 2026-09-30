import type { Metadata } from "next";
import ProductLanding from "@/components/marketing/ProductLanding";
import { CATALOG } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site-config";

const product = CATALOG.pearls;

export const metadata: Metadata = {
  title: product.metaTitle,
  description: product.metaDescription,
  alternates: { canonical: absoluteUrl(`/${product.slug}`) },
};

export default function Page() {
  return <ProductLanding product={product} />;
}
