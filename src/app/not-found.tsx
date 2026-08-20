import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | SonoPrep",
  description:
    "This page doesn't exist. Head back to SonoPrep to continue your SPI exam prep.",
};

export default function NotFound() {
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
          404
        </p>

        <h1
          className="text-5xl sm:text-6xl font-bold leading-tight mb-6"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            color: "#ffffff",
            letterSpacing: "-0.03em",
          }}
        >
          This page doesn&apos;t exist.
        </h1>

        <p
          className="text-base leading-relaxed mb-10"
          style={{ fontFamily: "'Source Serif 4', serif", color: "#B8B0A6" }}
        >
          The SPI does test your knowledge of what&apos;s real and what
          isn&apos;t — but this URL is definitely an artifact.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 rounded-md text-sm font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #c85b3a, #e06840)",
              fontFamily: "'Source Serif 4', serif",
            }}
          >
            Back to Home →
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center px-8 py-4 rounded-md text-sm border"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "#B8B0A6",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            Try the Free Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
