import type { ReactNode } from "react";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site-config";

export type FAQ = { question: string; answer: string };

type Props = {
  slug: string;
  title: string;
  description: string;
  label: string;
  answer: ReactNode;
  takeaways: string[];
  faqs: FAQ[];
  children: ReactNode;
  howToSteps?: string[];
};

const published = "2026-11-02";

function Byline() {
  return (
    <div className="flex items-start gap-4 border-y border-white/10 py-5 text-sm text-[#c2bab0]">
      <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c85b3a]/20 font-semibold text-[#e9957b]">SP</div>
      <div>
        <p className="text-white font-semibold">SonoPrep Clinical Education Team</p>
        <p>RDMS-led SPI study materials. Instructor background supplied by SonoPrep: 10+ years in clinical practice and teaching; curriculum development at Houston International Cardiotech Ultrasound School (HICUS), Houston, TX.</p>
        <p className="mt-1 text-xs text-[#a89f96]">Updated: November 2026 · Editorial team attribution; an individual instructor name and independent credential verification have not been provided.</p>
      </div>
    </div>
  );
}

export function EditorialTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto my-6 border border-white/10 rounded-sm">
      <table className="w-full min-w-[540px] text-sm text-left border-collapse">
        <thead className="bg-white/5"><tr>{headers.map(h => <th key={h} scope="col" className="px-4 py-3 text-white font-semibold align-top">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className="border-t border-white/10">{row.map((cell, j) => <td key={j} className="px-4 py-3 align-top">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function Internal({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="text-[#ef9d82] underline underline-offset-4 hover:text-white" href={href}>{children}</Link>;
}

export default function EditorialArticle({ slug, title, description, label, answer, takeaways, faqs, children, howToSteps }: Props) {
  const url = absoluteUrl(`/blog/${slug}`);
  const graph: Record<string, unknown>[] = [
      {
        "@type": "Article", "@id": `${url}#article`, headline: title, description, url,
        datePublished: published, dateModified: published, inLanguage: "en-US",
        author: { "@type": "Organization", name: "SonoPrep Clinical Education Team", url: absoluteUrl("/") },
        publisher: { "@type": "Organization", name: "SonoPrep", url: absoluteUrl("/"), logo: { "@type": "ImageObject", url: absoluteUrl("/logo.webp") } },
        image: { "@type": "ImageObject", url: absoluteUrl("/og-image.png") },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ] },
      { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: faqs.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
    ];
  if (howToSteps?.length) graph.push({
    "@type": "HowTo", "@id": `${url}#howto`, name: title,
    step: howToSteps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
  });
  const schema = { "@context": "https://schema.org", "@graph": graph };
  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <div className="max-w-3xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-xs text-[#b3a99f] mb-8"><Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / {label}</nav>
        <span className="inline-block bg-[#c85b3a] px-2 py-1 text-[10px] meta text-white mb-5">{label.toUpperCase()}</span>
        <h1 className="display-display text-3xl sm:text-5xl leading-tight text-white mb-8">{title}</h1>
        <Byline />
        <article className="mt-8 text-[#c2bab0] body-readable leading-relaxed space-y-6 [&_h2]:text-white [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:pt-8 [&_h3]:text-white [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_strong]:text-white">
          <aside aria-label="Quick answer" className="bg-[#c85b3a]/10 border-l-[3px] border-[#c85b3a] p-6"><p className="text-white font-semibold mb-2">Quick answer</p><div>{answer}</div></aside>
          <section aria-label="Key takeaways"><h2 className="!pt-0">Key takeaways</h2><ul>{takeaways.map(t => <li key={t}>{t}</li>)}</ul></section>
          {children}
          <section aria-labelledby="faq-title"><h2 id="faq-title">Frequently asked questions</h2>{faqs.map(f => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}</section>
          <aside className="bg-[#c85b3a]/10 border-l-[3px] border-[#c85b3a] p-6">
            <h2 className="!pt-0">Need the full study system?</h2>
            <p>The $99 Premium Bundle includes the simulator, notes, flashcards and Physics Pearls for 45 days. One payment, no subscription. Review the details and the 10-day refund terms before deciding.</p>
            <Link href="/products" className="btn-industrial inline-block mt-5 px-5 py-3">See the $99 bundle</Link>
          </aside>
          <Byline />
          <p className="text-xs text-[#a89f96] border-t border-white/10 pt-6"><em>SonoPrep is not affiliated with, endorsed by, or connected to ARDMS® or Inteleos. SPI® is a registered trademark of ARDMS. All practice questions on this site are independently written and are not official ARDMS exam questions. SonoPrep does not predict official exam results. Always confirm current eligibility, fees, and rules at ardms.org.</em></p>
        </article>
      </div>
    </main>
  );
}
