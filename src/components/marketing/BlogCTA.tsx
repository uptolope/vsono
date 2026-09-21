import Link from "next/link";

interface BlogCTAProps {
  topic?: string;
}

export default function BlogCTA({
  topic = "Ultrasound Physics",
}: BlogCTAProps) {
  return (
    <aside className="mt-12 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-lg">
      <div className="max-w-2xl">
        <span className="text-sm font-semibold uppercase tracking-wider text-sky-400">
          Free Diagnostic Practice
        </span>

        <h3 className="mt-1 mb-3 text-2xl font-bold">
          Testing your knowledge on {topic}?
        </h3>

        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          Do not leave your ARDMS license to chance. Practice test-style
          questions with instant rationale breakdowns on our realistic exam
          simulator.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/demo"
            className="rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400"
          >
            Try the Free SPI Demo
          </Link>

          <Link
            href="/products"
            className="rounded-lg border border-slate-600 px-6 py-3 text-sm text-slate-200 transition-colors hover:border-slate-400"
          >
            View Study Packages
          </Link>
        </div>
      </div>
    </aside>
  );
}
