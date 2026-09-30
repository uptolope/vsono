import Link from "next/link";
import type { ReactNode } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/site-config";
import { BUNDLE, CATALOG, REFUND_DAYS, type CatalogEntry } from "@/lib/catalog";

/**
 * Public, server-rendered landing page for one product.
 *
 * Structured data is deliberately limited to Product + Offer with real price
 * and availability. There is NO aggregateRating / Review markup: SonoPrep has
 * no verified, first-party reviews to mark up, and self-serving or invented
 * review markup violates search-engine guidelines.
 */
export default function ProductLanding({
  product,
  sample,
}: {
  product: CatalogEntry;
  /** Optional free sample (demo data only — never paid content). */
  sample?: ReactNode;
}) {
  const url = absoluteUrl(`/${product.slug}`);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    url,
    category: "Educational software",
    brand: { "@type": "Brand", name: "SonoPrep" },
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "SonoPrep" },
    },
  };

  const others = Object.values(CATALOG).filter((p) => p.key !== product.key);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Products", url: absoluteUrl("/products") },
          { name: product.name, url },
        ]}
      />

      <main className="min-h-screen px-6 pb-20 pt-28">
        <div className="mx-auto max-w-3xl space-y-12">
          <header>
            <p className="meta mb-3 text-[11px] text-[#c85b3a]">
              ARDMS SPI EXAM PREP
            </p>
            <h1 className="display-display mb-5 text-3xl leading-tight text-white sm:text-5xl">
              {product.headline}
            </h1>
            <p className="body-readable text-lg leading-relaxed text-[#c2bab0]">
              {product.summary}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="btn-industrial px-6 py-3 text-[11px]"
              >
                GET {product.name.toUpperCase()} — {product.priceLabel} →
              </Link>
              <Link
                href="/demo"
                className="btn-industrial-outline px-6 py-3 text-[11px]"
              >
                TRY THE FREE DEMO
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#8a8279]">
              {product.priceLabel} one-time payment · {product.accessDays}-day
              access from purchase · {REFUND_DAYS}-day refund · no subscription
            </p>
          </header>

          <section>
            <h2 className="display-serif mb-4 text-2xl font-semibold text-white">
              Who it&apos;s for
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-[#c2bab0]">
              {product.whoFor.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="display-serif mb-4 text-2xl font-semibold text-white">
              What&apos;s included
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-[#c2bab0]">
              {product.included.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="display-serif mb-4 text-2xl font-semibold text-white">
              How it works
            </h2>
            <ol className="list-decimal space-y-2 pl-6 text-[#c2bab0]">
              {product.howItWorks.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ol>
          </section>

          {sample}

          <section className="rounded border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="display-serif mb-3 text-xl font-semibold text-white">
              Price, access and refunds
            </h2>
            <ul className="space-y-2 text-sm text-[#c2bab0]">
              <li>
                <strong className="text-white">{product.name}:</strong>{" "}
                {product.priceLabel}, {product.accessDays} days of access from
                purchase.
              </li>
              <li>
                <strong className="text-white">Premium Bundle:</strong>{" "}
                {BUNDLE.priceLabel} for all four products (
                {BUNDLE.individualTotalLabel} bought separately), with{" "}
                {BUNDLE.accessDays} days of access.
              </li>
              <li>
                <strong className="text-white">Refunds:</strong> email{" "}
                <a
                  href="mailto:support@sonoprep.com"
                  className="text-[#c85b3a] hover:text-white"
                >
                  support@sonoprep.com
                </a>{" "}
                within {REFUND_DAYS} days of purchase. See the{" "}
                <Link
                  href="/terms"
                  className="text-[#c85b3a] hover:text-white"
                >
                  terms
                </Link>
                .
              </li>
              <li>
                SonoPrep does not guarantee exam results and is not affiliated
                with or endorsed by ARDMS.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="display-serif mb-4 text-2xl font-semibold text-white">
              Questions
            </h2>
            <div className="space-y-5">
              {product.faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="mb-1 font-semibold text-white">{f.q}</h3>
                  <p className="text-[#c2bab0]">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <nav aria-label="Related" className="grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="meta mb-3 text-[11px] text-[#8a8279]">
                KEEP READING
              </h2>
              <ul className="space-y-2 text-sm">
                {product.related.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      className="text-[#c85b3a] hover:text-white"
                    >
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="meta mb-3 text-[11px] text-[#8a8279]">
                OTHER PRODUCTS
              </h2>
              <ul className="space-y-2 text-sm">
                {others.map((o) => (
                  <li key={o.key}>
                    <Link
                      href={`/${o.slug}`}
                      className="text-[#c85b3a] hover:text-white"
                    >
                      {o.name} — {o.priceLabel}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/products"
                    className="text-[#c85b3a] hover:text-white"
                  >
                    Compare all products and the Premium Bundle
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </main>
    </>
  );
}
