'use client';

import type { Metadata } from "next";
import Link from "next/link";
import { useEffect } from 'react';
import GetStartedClient from "./GetStartedClient";

export const metadata: Metadata = {
  title: "Claim Free Instant Access | SonoPrep ARDMS SPI Prep",
  description:
    "Enter your email to unlock instant diagnostic access to a free ARDMS SPI practice exam, ultrasound formula sheet, and study resources.",
  alternates: {
    canonical: "https://www.sonoprep.com/get-started",
  },
  openGraph: {
    title: "Claim Free Instant Access | SonoPrep",
    description:
      "Unlock a free ARDMS SPI diagnostic test and ultrasound physics study resources.",
    url: "https://www.sonoprep.com/get-started",
    siteName: "SonoPrep",
    type: "website",
  },
};

export default function GetStartedPage() {
  // TAG 3: Free Demo Signup Conversion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.uetq = window.uetq || [];
      window.uetq.push('event', '', { 'revenue_value': 0, 'currency': 'USD' });
    }
  }, []);

  const leadSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "SonoPrep Free Diagnostic Study Access",
    description:
      "Free ARDMS SPI diagnostic practice test and ultrasound physics study resources.",
    url: "https://www.sonoprep.com/get-started",
    publisher: {
      "@type": "Organization",
      name: "SonoPrep",
      url: "https://www.sonoprep.com",
    },
  };

  return (
    <main className="min-h-screen bg-[#0B0D10] text-[#c2bab0] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(leadSchema),
        }}
      />

      <header className="border-b border-white/[0.06] py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="display-serif text-2xl text-white">
            <span className="text-[#c85b3a]">Sono</span>Prep
          </Link>

          <Link
            href="/login"
            className="meta text-[9px] text-[#8a8279] hover:text-white transition-colors"
          >
            ALREADY HAVE ACCESS? SIGN IN →
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <GetStartedClient />
      </div>

      <footer className="border-t border-white/[0.06] py-6 text-center">
        <p className="meta text-[9px] text-[#4a453f]">
          © {new Date().getFullYear()} SonoPrep. ARDMS® is a registered
          trademark of Inteleos.
        </p>
      </footer>
    </main>
  );
}