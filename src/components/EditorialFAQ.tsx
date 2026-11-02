import { absoluteUrl } from "@/lib/site-config";

export default function EditorialFAQ({ slug, items }: { slug: string; items: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(`/blog/${slug}`)}#faq`,
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question", name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return <section aria-labelledby="faq-title">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <h2 id="faq-title" className="display-serif text-2xl font-semibold text-white mt-10 mb-4">Frequently asked questions</h2>
    {items.map(({ question, answer }) => <div key={question} className="mb-6"><h3 className="display-serif text-lg font-semibold text-white mb-2">{question}</h3><p>{answer}</p></div>)}
  </section>;
}
