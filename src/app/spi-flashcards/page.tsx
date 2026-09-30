import type { Metadata } from "next";
import ProductLanding from "@/components/marketing/ProductLanding";
import { CATALOG } from "@/lib/catalog";
import { DEMO_FLASHCARDS } from "@/lib/demo/flashcard-data";
import { absoluteUrl } from "@/lib/site-config";

const product = CATALOG.flashcards;

export const metadata: Metadata = {
  title: product.metaTitle,
  description: product.metaDescription,
  alternates: { canonical: absoluteUrl(`/${product.slug}`) },
};

export default function Page() {
  const cards = DEMO_FLASHCARDS.slice(0, 3);

  return (
    <ProductLanding
      product={product}
      sample={
        <section>
          <h2 className="display-serif mb-2 text-2xl font-semibold text-white">
            Sample cards
          </h2>
          <p className="mb-4 text-sm text-[#8a8279]">
            These are from the free demo set, which is separate from the 200-card
            paid deck.
          </p>
          <div className="space-y-3">
            {cards.map((c) => (
              <details
                key={c.id}
                className="rounded border border-white/[0.08] bg-white/[0.02] p-4"
              >
                <summary className="cursor-pointer font-medium text-white">
                  {c.question}
                </summary>
                <p className="mt-3 text-[#c2bab0]">{c.answer}</p>
              </details>
            ))}
          </div>
        </section>
      }
    />
  );
}
