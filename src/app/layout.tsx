import type { Metadata } from 'next';
import Providers from './providers';
import StructuredData from '@/components/StructuredData';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sonoprep.com'),
  title: {
    default: 'SonoPrep - Pass the ARDMS SPI Exam on Your First Attempt',
    template: '%s | SonoPrep',
  },
  description:
    'Master the ARDMS SPI exam with high-yield physics questions, interactive mock exams, spaced-repetition flashcards, and physics pearls.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.sonoprep.com',
    siteName: 'SonoPrep',
    title: 'SonoPrep - Pass the ARDMS SPI Exam on Your First Attempt',
    description:
      'Master the ARDMS SPI exam with high-yield physics questions, mock exams, flashcards, and ultrasound physics study tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SonoPrep ARDMS SPI Exam Preparation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SonoPrep - Pass the ARDMS SPI Exam',
    description:
      'Prepare for the ARDMS SPI exam with SonoPrep study tools.',
    images: ['/og-image.png'],
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

        {/* ===== MICROSOFT UET TRACKING TAGS ===== */}

        {/* TAG 1: UET Base Tag - Tracks all page activity */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w, d, t, u, o) {
                w[u] = w[u] || [], o.ts = (new Date).getTime();
                var n = d.createElement(t);
                n.src = "https://bat.bing.net/bat.js?ti=" + o.ti + ("uetq" != u ? "&q=" + u : ""),
                n.async = 1, n.onload = n.onreadystatechange = function() {
                  var s = this.readyState;
                  s && "loaded" !== s && "complete" !== s ||
                  (o.q = w[u], w[u] = new UET(o), w[u].push("pageLoad"),
                  n.onload = n.onreadystatechange = null)
              };
                var i = d.getElementsByTagName(t)[0];
                i.parentNode.insertBefore(n, i);
              })(window, document, "script", "uetq", {
                ti:"343272856",
                enableAutoSpaTracking: true
              });
            `,
          }}
        />

        {/* TAG 2: Enhanced Conversion Tracking - Captures user email and phone */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.uetq = window.uetq || [];
              window.uetq.push('set', { 'pid': { 
                'em': '',
                'ph': '',
              } });
            `,
          }}
        />

        {/* ===== END MICROSOFT UET TRACKING TAGS ===== */}

        {/* ===== GOOGLE ANALYTICS ===== */}

        {/* Google Analytics Script */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SD4LQYY442"
        ></script>

        {/* Google Analytics Configuration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SD4LQYY442', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* ===== END GOOGLE ANALYTICS ===== */}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}