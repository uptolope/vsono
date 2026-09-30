import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ARDMS SPI Practice Test: 10 Questions",
  description:
    "Take a free 10-question ARDMS SPI practice test with instant answers, explanations, and domain feedback. No signup required.",
  keywords: [
    "free SPI practice test",
    "ARDMS SPI practice questions free",
    "ultrasound physics practice test",
    "SPI exam questions",
    "sonography physics practice",
  ],
  openGraph: {
    title: "Free ARDMS SPI Practice Test | SonoPrep",
    description:
      "Test your ultrasound physics knowledge with 10 free SPI practice questions and instant explanations.",
    url: "https://www.sonoprep.com/free-spi-practice-test",
    siteName: "SonoPrep",
    type: "website",
  },
  alternates: {
    canonical: "https://www.sonoprep.com/free-spi-practice-test",
  },
};

export default function FreeSpiPracticeTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
