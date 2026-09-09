'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ViewerMeta {
  title: string;
  shortTitle: string;
  pageCount: number;
  downloadsEnabled: boolean;
  watermarkText: string;
  accountIdentifier: string;
  accessDate: string;
  expiresAt: string | null;
}

type ViewerState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }
  | { status: 'ready'; meta: ViewerMeta };

export default function SonographicPhysicsViewerPage() {
  const { status: sessionStatus } = useSession();
  const [state, setState] = useState<ViewerState>({ status: 'loading' });
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (sessionStatus === 'unauthenticated') {
      setState({ status: 'unauthenticated' });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/study-notes/viewer-meta');
        if (cancelled) return;
        if (res.status === 401) {
          setState({ status: 'unauthenticated' });
          return;
        }
        if (res.status === 403) {
          setState({ status: 'unauthorized' });
          return;
        }
        if (!res.ok) {
          setState({ status: 'error', message: 'Could not load the viewer.' });
          return;
        }
        const meta = (await res.json()) as ViewerMeta;
        setState({ status: 'ready', meta });
      } catch {
        if (!cancelled) {
          setState({ status: 'error', message: 'Could not load the viewer.' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  const goTo = useCallback(
    (n: number, pageCount: number) => {
      const clamped = Math.min(Math.max(n, 1), pageCount);
      setImgLoading(true);
      setImgError(false);
      setPage(clamped);
    },
    []
  );

  // Disable the ordinary right-click context menu and common
  // save/print shortcuts while the viewer is open. This raises the
  // bar for casual, one-click saving — it does not and cannot stop
  // screenshots, screen recording, photographing the screen, OCR, or
  // someone inspecting network/browser devtools directly.
  useEffect(() => {
    if (state.status !== 'ready') return;
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();
    const blockShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isSaveOrPrint = (e.ctrlKey || e.metaKey) && (key === 's' || key === 'p');
      if (isSaveOrPrint) e.preventDefault();
    };
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockShortcuts);
    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockShortcuts);
    };
  }, [state.status]);

  if (state.status === 'loading') {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm">Loading viewer…</p>
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
          Please log in to access Sonographic Physics.
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
          Sonographic Physics is included with Study Notes.
        </p>
        <Link href="/products" className="btn-industrial px-6 py-3 text-[10px]">
          VIEW PRODUCTS →
        </Link>
      </Centered>
    );
  }

  if (state.status === 'error') {
    return (
      <Centered>
        <p className="body-readable text-[#8a8279] text-sm">{state.message}</p>
      </Centered>
    );
  }

  const { meta } = state;
  const pageImgSrc = `/api/study-notes/pages/${page}`;

  return (
    <div
      className="min-h-screen bg-[#0c0b0a] flex flex-col select-none"
      style={{ userSelect: 'none' }}
    >
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
        <div>
          <h1 className="text-white text-sm font-semibold">{meta.shortTitle}</h1>
          <p className="text-[#8a8279] text-xs">
            Page {page} of {meta.pageCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-industrial px-3 py-2 text-[10px]"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="text-[#8a8279] text-xs w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="btn-industrial px-3 py-2 text-[10px]"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto flex items-center justify-center p-4 relative">
        <div
          className="relative"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          {imgLoading && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[#8a8279] text-sm">Loading page…</p>
            </div>
          )}
          {imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[#8a8279] text-sm">
                This page could not be loaded.
              </p>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={page}
            src={pageImgSrc}
            alt={`${meta.shortTitle} — page ${page}`}
            draggable={false}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgLoading(false);
              setImgError(true);
            }}
            onContextMenu={(e) => e.preventDefault()}
            className="max-w-full h-auto"
            style={{ pointerEvents: 'none' }}
          />

          {/* Repeated faint watermark tiling over the page */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                watermarkSvg(meta.accountIdentifier, meta.accessDate)
              )}")`,
              backgroundRepeat: 'repeat',
              opacity: 0.12,
            }}
          />
          {/* One clearer watermark line, harder to crop out entirely */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/70 whitespace-nowrap"
          >
            {meta.watermarkText} — {meta.accountIdentifier} — {meta.accessDate.slice(0, 10)}
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-3 px-4 py-3 border-t border-white/10">
        <button
          className="btn-industrial px-4 py-2 text-[10px]"
          onClick={() => goTo(page - 1, meta.pageCount)}
          disabled={page <= 1}
        >
          ← PREV
        </button>
        <input
          type="number"
          min={1}
          max={meta.pageCount}
          value={page}
          onChange={(e) => goTo(Number(e.target.value), meta.pageCount)}
          className="w-16 bg-transparent border border-white/20 text-white text-center text-xs py-2 rounded"
        />
        <button
          className="btn-industrial px-4 py-2 text-[10px]"
          onClick={() => goTo(page + 1, meta.pageCount)}
          disabled={page >= meta.pageCount}
        >
          NEXT →
        </button>
      </footer>

      <p className="text-center text-[10px] text-[#5a5348] pb-3">
        {meta.watermarkText}
      </p>
    </div>
  );
}

function watermarkSvg(identifier: string, accessDate: string) {
  const label = `${identifier} · ${accessDate.slice(0, 10)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
    <text x="10" y="80" transform="rotate(-30 10,80)" font-size="14" fill="white" font-family="sans-serif">${escapeXml(
      label
    )}</text>
  </svg>`;
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0c0b0a] flex flex-col items-center justify-center px-6 text-center">
      {children}
    </div>
  );
}
