import type { Metadata } from "next";
import ProductLanding from "@/components/marketing/ProductLanding";
import { CATALOG } from "@/lib/catalog";
import { DEMO_QUESTIONS } from "@/lib/demo/exam-data";
import { absoluteUrl } from "@/lib/site-config";

const product = CATALOG.simulator;

export const metadata: Metadata = {
  title: product.metaTitle,
  description: product.metaDescription,
  alternates: { canonical: absoluteUrl(`/${product.slug}`) },
};

export default function Page() {
  const q = DEMO_QUESTIONS[0];

  return (
    <ProductLanding
      product={product}
      sample={
        <section>
          <h2 className="display-serif mb-2 text-2xl font-semibold text-white">
            Sample question
          </h2>
          <p className="mb-4 text-sm text-[#8a8279]">
            From the free demo set, which is separate from the paid 155-question
            bank.
          </p>
          <div className="rounded border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="mb-3 font-medium text-white">{q.question}</p>
            <ol className="list-[upper-alpha] space-y-1 pl-6 text-[#c2bab0]">
              {q.options.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ol>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-[#c85b3a]">
                Show answer and rationale
              </summary>
              <p className="mt-3 text-[#c2bab0]">
                <strong className="text-white">
                  Answer: {String.fromCharCode(65 + q.correctAnswer)}.
                </strong>{" "}
                {q.explanation}
              </p>
            </details>
          </div>
        </section>
      }
    />
  );
}
