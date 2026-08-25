import type { Metadata } from "next";
import { HomePageClient } from "./page-client";
import { FaqSchema } from "@/components/marketing/faq-schema";

export const metadata: Metadata = {
  title: "SonoPrep — Pass the ARDMS SPI Exam on Your First Attempt",
  description:
    "The focused SPI exam prep system built around the official ARDMS content outline. Question bank, flashcards, physics notes, and a full exam simulator. 10-day money-back guarantee.",
  keywords: [
    "ARDMS SPI exam prep",
    "SPI exam study guide",
    "sonography physics exam",
    "ARDMS exam simulator",
    "SPI flashcards",
    "ultrasound physics SPI",
  ],
  openGraph: {
    title: "SonoPrep — Pass the ARDMS SPI Exam on Your First Attempt",
    description:
      "Question bank, flashcards, physics notes, and a full exam simulator — all mapped to the ARDMS SPI content outline. Try free, no account required.",
    url: "https://sonoprep.com",
    siteName: "SonoPrep",
    type: "website",
  },
  alternates: {
    canonical: "https://sonoprep.com",
  },
};

export default function Page() {
  return (
    <>
      <FaqSchema />
      <HomePageClient />
    </>
  );
}
