import type { Metadata } from "next";
import { HomePageClient } from "./page-client";

export const metadata: Metadata = {
  title: "SonoPrep - Pass the ARDMS SPI Exam on Your First Attempt",
  description:
    "Master the ARDMS SPI exam with high-yield physics questions, interactive mock exams, spaced-repetition flashcards, and physics pearls.",
  alternates: {
    canonical: "https://sonoprep.com",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
