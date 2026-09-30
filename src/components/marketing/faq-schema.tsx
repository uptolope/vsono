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
export function FaqSchema() {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
