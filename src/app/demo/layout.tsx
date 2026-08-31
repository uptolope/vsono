import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SPI Exam Demo — Try Before You Buy | SonoPrep",
  description:
    "Try SonoPrep free. 10 real SPI exam questions and 10 flashcards — no account, no credit card. See exactly what the full simulator feels like before you decide.",
  keywords: [
    "SPI exam demo",
    "free SPI practice questions",
    "ARDMS SPI simulator demo",
    "sonography exam practice free",
    "SPI flashcards free trial",
  ],
  openGraph: {
    title: "Free SPI Exam Demo — Try Before You Buy | SonoPrep",
    description:
      "10 real SPI questions. 10 flashcards. No account required. Find out what you'd get wrong if you took the SPI today.",
    url: "https://sonoprep.com/demo",
    siteName: "SonoPrep",
    type: "website",
  },
  alternates: {
    canonical: "https://sonoprep.com/demo",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
