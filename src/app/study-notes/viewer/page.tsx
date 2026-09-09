"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ViewerMeta {
  title: string;
  shortTitle: string;
  category?: string;
  pageCount: number;
  downloadsEnabled: boolean;
  watermarkText: string;
  accountIdentifier: string;
  accessDate: string;
  expiresAt: string | null;
}

type ViewerState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "unauthorized" }
  | { status: "error"; message: string }
  | { status: "ready"; meta: ViewerMeta };

export default function SonographicPhysicsViewerPage() {
  const { status: sessionStatus } = useSession();

  const [state, setState] = useState<ViewerState>({
    status: "loading",
  });
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (sessionStatus === "unauthenticated") {
      setState({ status: "unauthenticated" });
      return;
    }

    let cancelled = false;

    async function loadViewerMetadata() {
      try {
        const response = await fetch("/api/study-notes/viewer-meta", {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          setState({ status: "unauthenticated" });
          return;
        }

        if (response.status === 403) {
          setState({ status: "unauthorized" });
          return;
        }

        if (!response.ok) {
          setState({
            status: "error",
            message: "Could not load the viewer.",
          });
          return;
        }

        const metadata = (await response.json()) as ViewerMeta;

        if (
          !metadata ||
          !Number.isInteger(metadata.pageCount) ||
          metadata.pageCount < 1
        ) {
          setState({
            status: "error",
            message: "The viewer returned invalid document metadata.",
          });
          return;
        }

        setState({
          status: "ready",
          meta: metadata,
        });
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Could not load the viewer.",
          });
        }
      }
    }

    void loadViewerMetadata();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  const goTo = useCallback((nextPage: number, pageCount: number) => {
    const clampedPage = Math.min(
      Math.max(Math.trunc(nextPage) || 1, 1),
      pageCount
    );

    setImgLoading(true);
    setImgError(false);
    setPage(clampedPage);
  }, []);

  // These are casual deterrents only. They cannot prevent screenshots,
  // screen recording, photography, OCR, browser devtools, or other
  // capture methods available to an authorized viewer.
  useEffect(() => {
    if (state.status !== "ready") {
      return;
    }

    const blockContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const blockShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifierPressed = event.ctrlKey || event.metaKey;
      const isSaveOrPrintShortcut =
        modifierPressed && (key === "s" || key === "p");

      if (isSaveOrPrintShortcut) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockShortcuts);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockShortcuts);
    };
  }, [state.status]);

  if (state.status === "loading") {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm">Loading viewer…</p>
      </Centered>
    );
  }

  if (state.status === "unauthenticated") {
    return (
      <Centered>
        <h1 className="display-serif mt-3 mb-4 text-3xl font-semibold text-white sm:text-4xl">
          Sign in required
        </h1>

        <p className="body-readable mb-8 text-sm text-[#8a8279]">
          Please log in to access Sonographic Physics.
        </p>

        <Link
          href="/login"
          className="btn-industrial px-6 py-3 text-[10px]"
        >
          SIGN IN →
        </Link>
      </Centered>
    );
  }

  if (state.status === "unauthorized") {
    return (
      <Centered>
        <h1 className="display-serif mt-3 mb-4 text-3xl font-semibold text-white sm:text-4xl">
          Purchase required
        </h1>

        <p className="body-readable mb-8 text-sm text-[#8a8279]">
          Sonographic Physics is included with Study Notes.
        </p>

        <Link
          href="/products"
          className="btn-industrial px-6 py-3 text-[10px]"
        >
          VIEW PRODUCTS →
        </Link>
      </Centered>
    );
  }

  if (state.status === "error") {
    return (
      <Centered>
        <p className="body-readable text-sm text-[#8a8279]">
          {state.message}
        </p>
      </Centered>
    );
  }

  const { meta } = state;
  const pageImageSource = `/api/study-notes/pages/${page}`;
  const accessDateLabel = formatAccessDate(meta.accessDate);

  return (
    <div
      className="flex min-h-screen select-none flex-col bg-[#0c0b0a]"
      style={{ userSelect: "none" }}
    >
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-sm font-semibold text-white">
            {meta.shortTitle}
          </h1>

          <p className="text-xs text-[#8a8279]">
            Page {page} of {meta.pageCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-industrial px-3 py-2 text-[10px]"
            onClick={() =>
              setZoom((currentZoom) =>
                Math.max(0.5, Number((currentZoom - 0.25).toFixed(2)))
              )
            }
            aria-label="Zoom out"
          >
            −
          </button>

          <span className="w-12 text-center text-xs text-[#8a8279]">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            className="btn-industrial px-3 py-2 text-[10px]"
            onClick={() =>
              setZoom((currentZoom) =>
                Math.min(3, Number((currentZoom + 0.25).toFixed(2)))
              )
            }
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-auto p-4">
        <div
          className="relative"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          {imgLoading && !imgError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <p className="text-sm text-[#8a8279]">Loading page…</p>
            </div>
          )}

          {imgError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0c0b0a]/80">
              <p className="text-sm text-[#8a8279]">
                This page could not be loaded.
              </p>
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={page}
            src={pageImageSource}
            alt={`${meta.shortTitle} — page ${page}`}
            draggable={false}
            onLoad={() => {
              setImgLoading(false);
              setImgError(false);
            }}
            onError={() => {
              setImgLoading(false);
              setImgError(true);
            }}
            onContextMenu={(event) => event.preventDefault()}
            className="block h-auto max-w-full"
            style={{ pointerEvents: "none" }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                watermarkSvg(meta.accountIdentifier, accessDateLabel)
              )}")`,
              backgroundRepeat: "repeat",
              opacity: 0.12,
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white/70"
          >
            {meta.watermarkText} — {meta.accountIdentifier} —{" "}
            {accessDateLabel}
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-3 border-t border-white/10 px-4 py-3">
        <button
          type="button"
          className="btn-industrial px-4 py-2 text-[10px]"
          onClick={() => goTo(page - 1, meta.pageCount)}
          disabled={page <= 1}
        >
          ← PREV
        </button>

        <label htmlFor="study-notes-page" className="sr-only">
          Page number
        </label>

        <input
          id="study-notes-page"
          type="number"
          min={1}
          max={meta.pageCount}
          value={page}
          onChange={(event) => {
            goTo(Number(event.target.value), meta.pageCount);
          }}
          onBlur={() => {
            goTo(page, meta.pageCount);
          }}
          className="w-16 rounded border border-white/20 bg-transparent py-2 text-center text-xs text-white"
          aria-label="Page number"
        />

        <button
          type="button"
          className="btn-industrial px-4 py-2 text-[10px]"
          onClick={() => goTo(page + 1, meta.pageCount)}
          disabled={page >= meta.pageCount}
        >
          NEXT →
        </button>
      </footer>

      <p className="pb-3 text-center text-[10px] text-[#5a5348]">
        {meta.watermarkText}
      </p>
    </div>
  );
}

function watermarkSvg(identifier: string, accessDate: string): string {
  const label = `${identifier} · ${accessDate}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
    <text
      x="10"
      y="80"
      transform="rotate(-30 10,80)"
      font-size="14"
      fill="white"
      font-family="sans-serif"
    >${escapeXml(label)}</text>
  </svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatAccessDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0b0a] px-6 text-center">
      {children}
    </div>
  );
}