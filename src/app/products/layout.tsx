import type { Metadata } from "next";

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
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
