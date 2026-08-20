import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/demo", label: "Free Demo" },
  { href: "/blog", label: "Blog" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#0B0D10] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <Link href="/" className="display-serif text-lg font-bold text-white tracking-tight">
              SonoPrep
            </Link>
            <p className="body-small text-[#4a453f] text-xs mt-1">
              ARDMS SPI exam prep — pass on your first attempt.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="meta text-[10px] text-[#8a8279] hover:text-white transition-colors"
              >
                {label.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/[0.04] pt-6 text-center">
          <p className="meta text-[9px] text-[#2e2b27]">
            © {new Date().getFullYear()} SonoPrep. All content is original and
            copyright protected. SonoPrep is not affiliated with or endorsed by
            ARDMS. SPI® is a registered trademark of ARDMS.
          </p>
        </div>
      </div>
    </footer>
  );
}
