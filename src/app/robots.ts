import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/auth/',
          '/billing/',
          '/login',
          '/signup',
          '/reset-password',
          '/forgot-password',
          '/verify-email',
          '/flashcards/review/',
          '/study-notes/viewer/',
        ],
      },
    ],
    sitemap: 'https://sonoprep.com/sitemap.xml',
  };
}
