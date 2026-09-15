import type { Metadata } from "next";
import { FaqSchema } from "@/components/marketing/faq-schema";
import { HomePageClient } from "./page-client";

export const metadata: Metadata = {
  title: "ARDMS SPI Exam Prep & Physics Simulator | SonoPrep",
  description:
    "Prepare for the ARDMS SPI exam with ultrasound physics explanations, calculators, flashcards, formula resources, diagnostic feedback, and practice exams.",
  alternates: {
    canonical: "https://sonoprep.com",
  },
  openGraph: {
    title: "ARDMS SPI Exam Prep & Physics Simulator | SonoPrep",
    description:
      "Prepare for the ARDMS SPI exam with ultrasound physics explanations, calculators, flashcards, formula resources, diagnostic feedback, and practice exams.",
    url: "https://sonoprep.com",
    siteName: "SonoPrep",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <FaqSchema />
      <HomePageClient />
    </>
  );
}


