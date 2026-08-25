import Link from "next/link";
import { headers } from "next/headers";
import type { ReactNode } from "react";

type BlogPostLayoutProps = {
  tag: string;
  title: string;
  date: string;
  read: string;
  url?: string;
  description?: string;
  children: ReactNode;
};

function toIsoDate(dateStr: string): string {
  const months: Record<string, string> = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };
  const parts = dateStr.replace(",", "").split(" ");
  const mm = months[parts[0]] ?? "01";
  const dd = (parts[1] ?? "01").padStart(2, "0");
  const yyyy = parts[2] ?? new Date().getFullYear().toString();
  return `${yyyy}-${mm}-${dd}`;
}

export default async function BlogPostLayout({
  tag,
  title,
  date,
  read,
  url,
  description,
  children,
}: BlogPostLayoutProps) {
  // Nonce from src/middleware.ts — required under the CSP's
  // 'nonce-...' script-src rule now that 'unsafe-inline' is gone.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const articleSchema = url
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description: description ?? "",
        url,
        datePublished: toIsoDate(date),
        dateModified: toIsoDate(date),
        author: {
          "@type": "Organization",
          name: "SonoPrep",
          url: "https://sonoprep.com",
        },
        publisher: {
          "@type": "Organization",
          name: "SonoPrep",
          url: "https://sonoprep.com",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      }
    : null;

  return (
    <>
      {articleSchema && (
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      <div className="min-h-screen pt-32 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="meta text-[11px] text-[#8a8279] hover:text-[#c85b3a] mb-8 inline-block"
          >
            ← BACK TO BLOG
          </Link>

          <div className="mb-12">
            <span className="inline-block bg-[#c85b3a] px-2 py-0.5 text-[10px] meta text-white mb-4">
              {tag}
            </span>
            <h1 className="display-display text-3xl sm:text-5xl text-white mt-2 mb-4 leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-3 text-[11px] text-[#8a8279] meta">
              <span>{date}</span>
              <span className="w-1 h-1 bg-[#c85b3a] rounded-full" />
              <span>{read}</span>
            </div>
          </div>

          <article className="space-y-8 text-[#c2bab0] body-readable leading-relaxed">
            {children}
          </article>

          <div className="mt-16 bg-[#c85b3a]/10 border-l-[3px] border-[#c85b3a] p-8">
            <p className="body-readable text-white text-sm mb-4">
              Ready to put this into practice? SonoPrep&apos;s exam simulator
              and flashcard system are built around the exact domains covered in
              this guide.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/demo" className="btn-industrial text-sm px-5 py-2.5">
                Try Free Demo
              </Link>
              <Link
                href="/products"
                className="text-sm text-[#c85b3a] hover:text-white border border-[#c85b3a]/40 px-5 py-2.5 transition-colors"
              >
                View Products
              </Link>
            </div>
          </div>

          <div className="mt-16 flex gap-6 text-sm text-[#8a8279] meta border-t border-white/8 pt-8">
            <Link href="/blog" className="hover:text-[#c85b3a]">
              All Articles
            </Link>
            <Link href="/terms" className="hover:text-[#c85b3a]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#c85b3a]">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export const proseClasses = {
  h2: "display-serif text-2xl font-semibold text-white mt-10 mb-4",
  h3: "display-serif text-lg font-semibold text-white mt-6 mb-3",
  ul: "list-disc pl-6 space-y-2",
  table: "w-full text-sm border-collapse mt-4 mb-4",
  th: "text-left text-white border-b border-white/10 pb-2 pr-4 meta text-[11px]",
  td: "border-b border-white/5 py-2 pr-4",
  callout: "bg-[#c85b3a]/10 border-l-[3px] border-[#c85b3a] p-5 my-6",
};
