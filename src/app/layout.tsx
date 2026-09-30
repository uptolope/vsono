import type { Metadata } from "next";
import Providers from "./providers";
import StructuredData from "@/components/StructuredData";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SonoPrep - ARDMS SPI Exam Preparation",
    template: "%s | SonoPrep",
  },
  description:
    "Prepare for the ARDMS SPI exam with independently written practice questions, timed simulator attempts, spaced-repetition flashcards, and ultrasound physics study tools.",
  // No site-wide canonical here: a root-level canonical of "/" is inherited by
  // every page that doesn't declare its own and would point it at the
  // homepage. Each indexable page sets its own `alternates.canonical`.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "SonoPrep",
    title: "SonoPrep - ARDMS SPI Exam Preparation",
    description:
      "Master the ARDMS SPI exam with high-yield physics questions, mock exams, flashcards, and ultrasound physics study tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SonoPrep - ARDMS SPI Exam Preparation",
    description: "Prepare for the ARDMS SPI exam with SonoPrep study tools.",
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
