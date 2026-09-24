'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ProtectedContent } from '@/components/protected-content';
import { useProtectedContent } from '@/lib/hooks/useProtectedContent';
import type { StudySection } from '@/lib/content/study-notes-data';
import { SONOGRAPHIC_PHYSICS_META } from '@/lib/content/sonographic-physics';

interface StudyNotesResponse {
  sections: StudySection[];
  expiresAt: string | null;
}

export default function StudyNotesPage() {
  const { data: session } = useSession();
  const { state, refetch } =
    useProtectedContent<StudyNotesResponse>('STUDY_NOTES');

  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm">Loading Study Notes</p>
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
          SIGN IN
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
          You don&apos;t have an active Study Notes purchase. Grab it or the
          Premium Bundle to unlock this content.
        </p>

        <Link
          href="/products"
          className="btn-industrial px-6 py-3 text-[10px]"
        >
          BROWSE PRODUCTS
        </Link>
      </Centered>
    );
  }

  if (state.status === 'error') {
    return (
      <Centered>
        <p className="text-[#c85b3a] text-sm mb-6">{state.message}</p>

        <button
          onClick={refetch}
          className="btn-industrial px-6 py-3 text-[10px]"
        >
          RELOAD
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

  const activeSection =
    sections.find((section) => section.id === activeSectionId) ?? sections[0];

  return (
    <div className="min-h-screen pt-28 px-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/account"
          className="meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] mb-8 inline-block transition-colors"
        >
          BACK TO ACCOUNT
        </Link>

        <section className="mb-8 rounded border border-[#c85b3a]/30 bg-[#c85b3a]/5 p-5 text-sm text-[#c2bab0]">
          <h2 className="font-semibold text-white">
            A quick note about your access
          </h2>

          <p className="mt-2 leading-6">
            These study notes are licensed for your personal use while your
            access is active. They are not public documents and may not be
            copied, shared, recorded, scraped, resold, or uploaded elsewhere.
          </p>

          <p className="mt-2 leading-6">
            Please keep your account private and do not share your login
            details. If misuse is detected, access may be suspended or
            cancelled.
          </p>
        </section>

        <div className="mb-10">
          <span className="meta text-[#c85b3a] text-sm">STUDY</span>

          <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold">
            Study Notes
          </h1>

          <p className="body-readable text-[#8a8279] text-sm mt-2">
            {sections.length} sections
            {expiresAt && (
              <span className="ml-2">
                Access until {new Date(expiresAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <div className="mb-10 border border-white/[0.06] rounded p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="meta text-[9px] text-[#4a453f]">
              {SONOGRAPHIC_PHYSICS_META.category} LICENSED BOARD-EXAM NOTES
            </span>

            <h2 className="display-serif text-xl text-white font-semibold mt-1">
              {SONOGRAPHIC_PHYSICS_META.title}
            </h2>

            <p className="body-small text-[#8a8279] text-xs mt-1">
              {SONOGRAPHIC_PHYSICS_META.pageCount} pages Included with your
              Study Notes access
              {expiresAt && (
                <span>
                  {' '}
                  Access until {new Date(expiresAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>

          <Link
            href="/study-notes/viewer"
            className="btn-industrial px-6 py-3 text-[10px] whitespace-nowrap"
          >
            OPEN SONOGRAPHIC PHYSICS
          </Link>
        </div>

        <section className="mb-10 rounded border border-white/[0.06] p-6">
          <h2 className="display-serif text-xl font-semibold text-white">
            Our 10-day refund policy
          </h2>

          <div className="mt-3 space-y-3 text-sm leading-6 text-[#c2bab0]">
            <p>
              If this is your first purchase of these study notes, you may
              request a refund within 10 calendar days of that purchase,
              subject to the conditions in our Terms.
            </p>

            <p>
              This 10-day period applies to the first purchase of this product
              only. Repurchases, renewals, and extensions do not create a new
              10-day refund period.
            </p>

            <p>
              Refund requests are reviewed using your purchase history and
              payment records. Creating another account or using another email
              address does not reset the original refund period.
            </p>

            <p>
              For purchase help, contact support with the email address used at
              checkout and your order information.
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`text-left px-4 py-2.5 rounded text-sm whitespace-nowrap md:whitespace-normal transition-colors \${
                  activeSection.id === section.id
                    ? 'bg-[#c85b3a]/10 text-[#c85b3a]'
                    : 'text-[#8a8279] hover:text-white'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>

          {/* PROTECTED CONTENT WRAPPER - START */}
          <ProtectedContent
            contentType="STUDY_NOTES"
            userId={session?.user?.email || 'user'}
            userName={session?.user?.name || 'User'}
            watermarkText="SONOPREP LICENSED CONTENT"
            showWatermark={true}
            disableRightClick={true}
            disableSelection={true}
          >
            <div className="space-y-6 min-w-0">
              {activeSection.cards.map((card, index) => (
                <div key={index} className="border border-white/[0.06] rounded p-6">
                  <h3 className="display-serif text-lg font-semibold text-white mb-1">
                    {card.title}
                  </h3>

                  <p className="meta text-[9px] text-[#4a453f] mb-4">
                    {card.subtitle}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {card.bullets.map((bullet, bulletIndex) => (
                      <li
                        key={bulletIndex}
                        className="body-small text-[#c2bab0] text-sm leading-relaxed flex gap-2"
                      >
                        <span className="text-[#c85b3a] shrink-0"></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {card.formulas.map((formula, formulaIndex) => (
                    <div
                      key={formulaIndex}
                      className="bg-white/[0.02] border border-white/[0.06] rounded p-4 mb-3"
                    >
                      <p className="meta text-[9px] text-[#c85b3a] mb-1">
                        {formula.title}
                      </p>

                      <p className="text-white text-sm font-mono mb-2">
                        {formula.formula}
                      </p>

                      <p className="body-small text-[#8a8279] text-xs leading-relaxed">
                        {formula.explanation}
                      </p>
                    </div>
                  ))}

                  {card.tables.map((table, tableIndex) => (
                    <div key={tableIndex} className="overflow-x-auto">
                      <table className="w-full text-sm mt-2">
                        <thead>
                          <tr>
                            {table.headers.map((header, headerIndex) => (
                              <th
                                key={headerIndex}
                                className="text-left meta text-[9px] text-[#4a453f] pb-2 pr-4"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {table.rows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="border-t border-white/[0.06]"
                            >
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="text-[#c2bab0] py-2 pr-4"
                                >
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
          </ProtectedContent>
          {/* PROTECTED CONTENT WRAPPER - END */}
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
