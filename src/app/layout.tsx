import type { Metadata } from "next";
import Providers from "./providers";
import StructuredData from "@/components/StructuredData";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sonoprep.com"),
  title: {
    default: "SonoPrep - ARDMS SPI Exam Preparation",
    template: "%s | SonoPrep",
  },
  description:
    "Prepare for the ARDMS SPI exam with independently written practice questions, timed simulator attempts, spaced-repetition flashcards, and ultrasound physics study tools.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sonoprep.com",
    siteName: "SonoPrep",
    title: "SonoPrep - ARDMS SPI Exam Preparation",
    description:
      "Master the ARDMS SPI exam with high-yield physics questions, mock exams, flashcards, and ultrasound physics study tools.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "SonoPrep ARDMS SPI Exam Preparation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SonoPrep - ARDMS SPI Exam Preparation",
    description: "Prepare for the ARDMS SPI exam with SonoPrep study tools.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline focus:outline-2 focus:outline-[#c85b3a]"
        >
          Skip to main content
        </a>

        <Providers>
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
