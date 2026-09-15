import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Physics Pearls | SonoPrep",
  description:
    "High-yield ultrasound physics concepts and review material for students preparing for the ARDMS SPI exam.",
  alternates: {
    canonical: "https://sonoprep.com/physics-pearls",
  },
  openGraph: {
    title: "Physics Pearls | SonoPrep",
    description:
      "High-yield ultrasound physics review material for the ARDMS SPI exam.",
    url: "https://sonoprep.com/physics-pearls",
    type: "website",
  },
};

export default function PhysicsPearlsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
