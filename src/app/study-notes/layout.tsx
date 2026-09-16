import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Notes | SonoPrep",
  description:
    "Structured ultrasound physics study notes for students preparing for the ARDMS SPI exam.",
  alternates: {
    canonical: "https://www.sonoprep.com/study-notes",
  },
  openGraph: {
    title: "Study Notes | SonoPrep",
    description:
      "Structured ultrasound physics study notes for the ARDMS SPI exam.",
    url: "https://www.sonoprep.com/study-notes",
    type: "website",
  },
};

export default function StudyNotesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
