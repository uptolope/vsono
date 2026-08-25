'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProtectedContent } from '@/lib/hooks/useProtectedContent';
import type { StudySection } from '@/lib/content/study-notes-data';

interface StudyNotesResponse {
  sections: StudySection[];
  expiresAt: string | null;
}

export default function StudyNotesPage() {
  const { state, refetch } = useProtectedContent<StudyNotesResponse>('STUDY_NOTES');
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm">Loading Study Notes…</p>
      </Centered>
    );
  }

  if (state.status === 'unauthenticated') {
    return (
      <Centered>
        <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold mb-4">
          Sign in required
        </h1>
        <p className="body-readable text-[#8a8279] text-sm mb-8">
          Please log in to access Study Notes.
        </p>
        <Link href="/login" className="btn-industrial px-6 py-3 text-[10px]">
          SIGN IN →
        </Link>
      </Centered>
    );
  }

  if (state.status === 'unauthorized') {
    return (
      <Centered>
        <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold mb-4">
          Purchase required
        </h1>
        <p className="body-readable text-[#8a8279] text-sm mb-8">
          You don&apos;t have an active Study Notes purchase. Grab it (or the
          Premium Bundle) to unlock this content.
        </p>
        <Link href="/products" className="btn-industrial px-6 py-3 text-[10px]">
          BROWSE PRODUCTS →
        </Link>
      </Centered>
    );
  }

  if (state.status === 'error') {
    return (
      <Centered>
        <p className="text-[#c85b3a] text-sm mb-6">{state.message}</p>
        <button onClick={refetch} className="btn-industrial px-6 py-3 text-[10px]">
          RELOAD →
        </button>
      </Centered>
    );
  }

  const { sections, expiresAt } = state.data;

  if (!sections || sections.length === 0) {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm mb-6">
          No Study Notes are available right now. Check back soon.
        </p>
      </Centered>
    );
  }

  const activeSection = sections.find((s) => s.id === activeSectionId) ?? sections[0];

  return (
    <div className="min-h-screen pt-28 px-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/account"
          className="meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] mb-8 inline-block transition-colors"
        >
          ← BACK TO ACCOUNT
        </Link>

        <div className="mb-10">
          <span className="meta text-[#c85b3a] text-sm">STUDY</span>
          <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold">
            Study Notes
          </h1>
          <p className="body-readable text-[#8a8279] text-sm mt-2">
            {sections.length} sections
            {expiresAt && (
              <span className="ml-2">
                • Access until {new Date(expiresAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          {/* Section nav */}
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`text-left px-4 py-2.5 rounded text-sm whitespace-nowrap md:whitespace-normal transition-colors ${
                  activeSection.id === section.id
                    ? 'bg-[#c85b3a]/10 text-[#c85b3a]'
                    : 'text-[#8a8279] hover:text-white'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>

          {/* Active section content */}
          <div className="space-y-6 min-w-0">
            {activeSection.cards.map((card, i) => (
              <div key={i} className="border border-white/[0.06] rounded p-6">
                <h3 className="display-serif text-lg font-semibold text-white mb-1">
                  {card.title}
                </h3>
                <p className="meta text-[9px] text-[#4a453f] mb-4">{card.subtitle}</p>
                <ul className="space-y-2 mb-4">
                  {card.bullets.map((bullet, bi) => (
                    <li key={bi} className="body-small text-[#c2bab0] text-sm leading-relaxed flex gap-2">
                      <span className="text-[#c85b3a] shrink-0">—</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                {card.formulas.map((f, fi) => (
                  <div key={fi} className="bg-white/[0.02] border border-white/[0.06] rounded p-4 mb-3">
                    <p className="meta text-[9px] text-[#c85b3a] mb-1">{f.title}</p>
                    <p className="text-white text-sm font-mono mb-2">{f.formula}</p>
                    <p className="body-small text-[#8a8279] text-xs leading-relaxed">{f.explanation}</p>
                  </div>
                ))}
                {card.tables.map((t, ti) => (
                  <div key={ti} className="overflow-x-auto">
                    <table className="w-full text-sm mt-2">
                      <thead>
                        <tr>
                          {t.headers.map((h, hi) => (
                            <th key={hi} className="text-left meta text-[9px] text-[#4a453f] pb-2 pr-4">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.rows.map((row, ri) => (
                          <tr key={ri} className="border-t border-white/[0.06]">
                            {row.map((cell, ci) => (
                              <td key={ci} className="text-[#c2bab0] py-2 pr-4">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-32 px-6 pb-24">
      <div className="max-w-2xl mx-auto text-center">{children}</div>
    </div>
  );
}
