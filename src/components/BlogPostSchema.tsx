interface FAQItem {
  question: string;
  answer: string;
}

interface BlogPostSchemaProps {
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
  dateModified?: string;
  faqs?: FAQItem[];
}

interface SchemaNode {
  '@type': string;
  [key: string]: unknown;
}

export default function BlogPostSchema({
  title,
  description,
  slug,
  datePublished = '2026-01-15T08:00:00+00:00',
  dateModified = '2026-06-15T12:00:00+00:00',
  faqs = [],
}: BlogPostSchemaProps) {
  const postUrl = `https://sonoprep.com/blog/${slug}`;

  const graph: SchemaNode[] = [
    {
      '@type': 'BlogPosting',
      '@id': `${postUrl}#article`,
      isPartOf: {
        '@type': 'WebPage',
        '@id': postUrl,
        url: postUrl,
        name: title,
      },
      headline: title,
      description,
      url: postUrl,
      datePublished,
      dateModified,
      inLanguage: 'en-US',
      mainEntityOfPage: postUrl,
      author: {
        '@type': 'Organization',
        name: 'SonoPrep Clinical Faculty',
        url: 'https://sonoprep.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'SonoPrep',
        url: 'https://sonoprep.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://sonoprep.com/logo.webp',
        },
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://sonoprep.com/og-image.png',
        width: 1200,
        height: 630,
      },
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${postUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graph,
        }),
      }}
    />
  );
}
