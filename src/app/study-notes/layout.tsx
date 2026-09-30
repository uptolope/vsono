import type { Metadata } from "next";

// Members-only app route (anonymous visitors only see a sign-in / purchase
// prompt). Noindex + excluded from the sitemap; see exam-simulator/layout.tsx.
export const metadata: Metadata = {
  title: "Study Notes",
  robots: { index: false, follow: true },
};

export default function StudyNotesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
