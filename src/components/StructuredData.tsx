import { SITE_URL, SOCIAL_PROFILES, SUPPORT_EMAIL } from "@/lib/site-config";

/**
 * Site-wide JSON-LD: Organization + WebSite only.
 *
 * - `sameAs` lists only real, owner-controlled profiles: the ones linked in the
 *   footer (src/lib/site-config.ts) plus any in NEXT_PUBLIC_SOCIAL_PROFILES
 *   (comma-separated URLs). Do not add profiles that do not exist.
 * - A site-wide `Course` node used to live here. It described every page as a
 *   course without the instance/offer data Google requires, so it was removed.
 * - No rating/review markup: there are no verified first-party reviews to mark
 *   up.
 */
export default function StructuredData() {
  const extra = (process.env.NEXT_PUBLIC_SOCIAL_PROFILES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^https:\/\//.test(s));
  const sameAs = Array.from(
    new Set([...SOCIAL_PROFILES.map((p) => p.href), ...extra]),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "SonoPrep",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.webp`,
        description:
          "ARDMS SPI exam preparation: practice exams, spaced-repetition flashcards, physics pearls and study notes.",
        sameAs,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: SUPPORT_EMAIL,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "SonoPrep",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
