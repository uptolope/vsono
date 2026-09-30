"use client";

import { useState } from "react";

type Props = {
  title: string;
  url: string;
  year: string;
  /** Show a "print this page" button (for cheat-sheet style pages). */
  printable?: boolean;
  /** Absolute URL of an embeddable version, if one exists. */
  embedUrl?: string;
};

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the text is still selectable */
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="meta text-[10px] text-[#8a8279]">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="text-xs text-[#c85b3a] hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded border border-white/[0.06] bg-black/30 p-3 text-xs text-[#c2bab0]">
        {value}
      </pre>
    </div>
  );
}

/** Cite / link-to-this-page helper — encourages real, attributed references. */
export default function CiteBox({
  title,
  url,
  year,
  printable,
  embedUrl,
}: Props) {
  const apa = `SonoPrep Editorial Team. (${year}). ${title}. SonoPrep. ${url}`;
  const iframe = embedUrl
    ? `<iframe src="${embedUrl}" title="${title}" width="100%" height="560" style="border:0;max-width:720px" loading="lazy"></iframe>`
    : null;
  const html = `<a href="${url}">${title}</a> (SonoPrep)`;

  return (
    <section
      aria-label="Cite or link to this resource"
      className="no-print rounded border border-white/[0.08] bg-white/[0.02] p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">
          Cite or share this resource
        </h2>
        {printable && (
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded border border-white/15 px-3 py-1.5 text-xs text-[#c2bab0] hover:border-white/40 hover:text-white"
          >
            Print or save as PDF
          </button>
        )}
      </div>
      <p className="mb-4 text-sm text-[#8a8279]">
        Instructors, program directors and study groups are welcome to link to
        this page or cite it.
      </p>
      <div className="space-y-4">
        <CopyRow label="APA" value={apa} />
        <CopyRow label="LINK (HTML)" value={html} />
        {iframe && <CopyRow label="EMBED (IFRAME — includes a credit link)" value={iframe} />}
      </div>
    </section>
  );
}
