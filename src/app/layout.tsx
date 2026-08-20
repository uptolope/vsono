import type { Metadata } from "next";
import { headers } from "next/headers";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sonoprep.com"),
  title: {
    default: "SonoPrep — Pass the ARDMS SPI Exam on Your First Attempt",
    template: "%s | SonoPrep",
  },
  description:
    "The focused SPI exam prep system built around the official ARDMS content outline. Question bank, flashcards, physics notes, and a full exam simulator.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "SonoPrep",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SonoPrep — ARDMS SPI Exam Preparation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SonoPrep",
  url: "https://sonoprep.com",
  description:
    "ARDMS SPI exam prep platform — question bank, flashcards, physics study notes, and exam simulator built around the official ARDMS content outline.",
  foundingLocation: {
    "@type": "Place",
    name: "Houston, TX",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SonoPrep",
  url: "https://sonoprep.com",
  description: "ARDMS SPI exam prep — pass on your first attempt.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://sonoprep.com/blog?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Nonce set by src/middleware.ts on every request — required so
  // these inline JSON-LD <script> tags are allowed under the CSP's
  // 'nonce-...' script-src rule instead of a blanket 'unsafe-inline'.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700;9..144,800;9..144,900&family=Source+Serif+4:opsz,wght@8..60,300;8..60,400;8..60,450;8..60,500;8..60,600;8..60,700&display=swap"
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body style={{ background: "#0B0D10" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
