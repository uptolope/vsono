import type { Metadata } from "next";

// Members-only app route: an anonymous visitor only ever sees a sign-in /
// purchase prompt, which is thin content. It is kept OUT of the sitemap and
// marked noindex (and intentionally NOT blocked in robots.txt, so crawlers can
// actually see the noindex). Public marketing for this product lives on
// /products, /demo and /free-spi-practice-test.
export const metadata: Metadata = {
  title: "ARDMS SPI Exam Simulator",
  robots: { index: false, follow: true },
};

export default function ExamSimulatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
