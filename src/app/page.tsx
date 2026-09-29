import type { Metadata } from "next";
import { HomePageClient } from "./page-client";

export const metadata: Metadata = {
  title: "SonoPrep - Prepare for the ARDMS SPI Exam With a Focused Study System",
  description:
    "Prepare for the ARDMS SPI exam with independently written practice questions, timed simulator attempts, spaced-repetition flashcards, and ultrasound physics study tools.",
  alternates: {
    canonical: "https://sonoprep.com",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
