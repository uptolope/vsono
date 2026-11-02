import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditorialArticle, { EditorialTable, type FAQ } from "@/components/EditorialArticle";
import { guides } from "@/lib/editorial-guides";
import { absoluteUrl } from "@/lib/site-config";

// Static sibling routes take precedence. Only the new, non-duplicative guides
// are generated here; unknown blog slugs correctly return 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return {};
  const url = absoluteUrl(`/blog/${slug}`);
  return {
    title: { absolute: guide.metaTitle },
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.description, type: "article", url },
  };
}

function RichText({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\((?:\/|https:\/\/)[^)]+\))/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\((\/[^)]+|https:\/\/[^)]+)\)$/);
    if (link) return link[2].startsWith("/")
      ? <Link key={i} className="text-[#ef9d82] underline underline-offset-4 hover:text-white" href={link[2]}>{link[1]}</Link>
      : <a key={i} href={link[2]} rel="noopener noreferrer" className="text-[#ef9d82] underline underline-offset-4 hover:text-white">{link[1]}</a>;
    return part;
  })}</>;
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();
  return <EditorialArticle
    slug={guide.slug} title={guide.title} description={guide.description}
    label={guide.label} answer={<p>{guide.answer.split(/(\$275|\b555\b|\b110\b|\b5 domains\b)/g).map((part, i) => /^(\$275|555|110|5 domains)$/.test(part) ? <strong key={i}>{part}</strong> : part)}</p>}
    takeaways={guide.takeaways} faqs={guide.faqs as FAQ[]}
    howToSteps={guide.howTo}
  >
    {guide.sections.map((section) => <section key={section.heading}>
      <h2>{section.heading}</h2>
      {section.paragraphs?.map((text, i) => <p key={i} className="mb-5"><RichText text={text} /></p>)}
      {section.table && <EditorialTable headers={section.table.headers} rows={section.table.rows.map(row => row.map(cell => <RichText key={cell} text={cell} />))} />}
      {section.bullets && <ul>{section.bullets.map(item => <li key={item}><RichText text={item} /></li>)}</ul>}
    </section>)}
    <p>Want to check the format before buying anything? Try the <Link href="/demo" className="text-[#ef9d82] underline underline-offset-4">free demo</Link>. For the full tool list, see <Link href="/products" className="text-[#ef9d82] underline underline-offset-4">SonoPrep products</Link>.</p>
  </EditorialArticle>;
}
