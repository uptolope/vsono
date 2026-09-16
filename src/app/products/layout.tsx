import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pricing & Products — SPI Exam Prep | SonoPrep",
  description:
    "SPI exam prep starting at $9. Flashcards, exam simulator, Physics Pearls, and study notes — or get the complete bundle for $99 and save $17 vs buying individually.",
  keywords: [
    "SPI exam prep pricing",
    "ARDMS SPI study materials",
    "SPI flashcards price",
    "SPI exam simulator",
    "sonography exam prep bundle",
  ],
  alternates: {
    canonical: "https://www.sonoprep.com/products",
  },
};

function ProductsSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "SonoPrep ARDMS SPI Exam Prep",
    description:
      "SPI exam preparation tools including flashcards, exam simulator, Physics Pearls, study notes, and a complete study bundle.",
    url: "https://www.sonoprep.com/products",
    brand: {
      "@type": "Brand",
      name: "SonoPrep",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "9.00",
      highPrice: "99.00",
      offerCount: 5,
      availability: "https://schema.org/InStock",
      url: "https://www.sonoprep.com/products",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function ProductsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <ProductsSchema />
      {children}
    </>
  );
}
