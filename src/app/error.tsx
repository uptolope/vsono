"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error monitoring service here (e.g. Sentry)
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#0B0D10" }}
    >
      <div className="text-center max-w-lg">
        <p
          className="text-[10px] uppercase tracking-[0.2em] mb-6"
          style={{ fontFamily: "'Source Serif 4', serif", color: "#c85b3a" }}
        >
          Something went wrong
        </p>

        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight mb-6"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            color: "#ffffff",
            letterSpacing: "-0.03em",
          }}
        >
          Unexpected error.
        </h1>

        <p
          className="text-base leading-relaxed mb-10"
          style={{ fontFamily: "'Source Serif 4', serif", color: "#B8B0A6" }}
        >
          Something went wrong on our end. Your progress hasn&apos;t been lost —
          try refreshing or go back to the home page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-8 py-4 rounded-md text-sm font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #c85b3a, #e06840)",
              fontFamily: "'Source Serif 4', serif",
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 rounded-md text-sm border"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "#B8B0A6",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            Back to Home
          </Link>
        </div>

        {error.digest && (
          <p
            className="mt-8 text-[10px] tracking-widest uppercase"
            style={{ fontFamily: "'Source Serif 4', serif", color: "#3a3530" }}
          >
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
