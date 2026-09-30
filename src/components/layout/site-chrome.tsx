"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Site-wide header + footer.
 *
 * Previously only the homepage rendered <Header/> and <Footer/>, so every
 * other page (products, blog posts, tools, demo, legal…) had no navigation
 * and no footer links — no internal-link paths for visitors or crawlers and
 * no Terms/Privacy links. Rendering them here gives every page the same
 * chrome. Embeddable widgets (/embed/*) are rendered bare.
 */
export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  // Embeds and the full-screen protected notes viewer bring their own layout.
  const bare =
    pathname.startsWith("/embed/") || pathname === "/study-notes/viewer";

  if (bare) {
    return <div id="main-content">{children}</div>;
  }

  return (
    <>
      <Header />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <Footer />
    </>
  );
}
