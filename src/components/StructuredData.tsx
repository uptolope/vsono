export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://sonoprep.com/#organization',
        name: 'SonoPrep',
        url: 'https://sonoprep.com',
        logo: 'https://sonoprep.com/logo.webp',
        description:
          'ARDMS SPI exam preparation, physics pearls, and timed mock simulators.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://sonoprep.com/#website',
        url: 'https://sonoprep.com',
        name: 'SonoPrep',
        publisher: {
          '@id': 'https://sonoprep.com/#organization',
        },
      },
      {
        '@type': 'Course',
        name: 'ARDMS SPI Ultrasound Physics Preparation Course',
        description:
          'Comprehensive preparation material, spaced-repetition flashcards, and mock exams for passing the ARDMS SPI examination.',
        provider: {
          '@id': 'https://sonoprep.com/#organization',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
