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
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
