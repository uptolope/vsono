import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SPI Exam Demo — Try Before You Buy | SonoPrep",
  description:
    "Try SonoPrep free. 5 real SPI exam questions and 20 flashcards — no account, no credit card. See exactly what the full simulator feels like before you decide.",
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
      "5 real SPI questions. 20 flashcards. No account required. Find out what you'd get wrong if you took the SPI today.",
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
