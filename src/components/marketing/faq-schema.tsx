import { headers } from "next/headers";
import { FAQS } from "@/lib/faq-data";

/**
 * Server component — renders the FAQPage JSON-LD schema in the initial HTML.
 * Import this in your page.tsx (server component) alongside <HomePageClient />
 * so crawlers see it in the raw HTML, not just after JS executes.
 *
 * Usage in src/app/page.tsx:
 *   import { FaqSchema } from "@/components/marketing/faq-schema";
 *   export default function Page() {
 *     return (
 *       <>
 *         <FaqSchema />
 *         <HomePageClient />
 *       </>
 *     );
 *   }
 */
export async function FaqSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  // Nonce from src/middleware.ts — required under the CSP's
  // 'nonce-...' script-src rule now that 'unsafe-inline' is gone.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
