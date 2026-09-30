import Link from "next/link";
import { SOCIAL_PROFILES } from "@/lib/site-config";

const FOOTER_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/demo", label: "Free Demo" },
  { href: "/blog", label: "Blog" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const SOCIAL_LINKS = SOCIAL_PROFILES;

const RESOURCE_LINKS = [
  { href: "/free-spi-practice-test", label: "Free SPI practice test" },
  { href: "/spi-physics-formula-sheet", label: "Formula sheet" },
  { href: "/spi-ultrasound-glossary", label: "Glossary" },
  { href: "/ultrasound-physics-calculators", label: "Physics calculators" },
  { href: "/tools/nyquist-calculator", label: "Nyquist calculator" },
  { href: "/blog/spi-study-plan-30-45-days", label: "SPI study plan" },
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
              ARDMS SPI exam prep.
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

        <nav
          aria-label="Free SPI study resources"
          className="mb-8 flex flex-wrap gap-x-6 gap-y-2"
        >
          <span className="meta text-[10px] text-[#4a453f]">FREE RESOURCES</span>
          {RESOURCE_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-[#8a8279] hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/[0.04] pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="meta text-[9px] text-[#2e2b27]">
              © {new Date().getFullYear()} SonoPrep. All content is original and
              copyright protected. SonoPrep is not affiliated with or endorsed by
              ARDMS. SPI® is a registered trademark of ARDMS.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#8a8279] hover:text-white transition-colors"
                >
                  {label === "LinkedIn" ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.249-.129.597-.129.946v5.421h-3.554s.05-8.746 0-9.637h3.554v1.364c.429-.646 1.199-1.538 2.914-1.538 2.127 0 3.72 1.395 3.72 4.393v5.418zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.704 0-.951.77-1.704 1.956-1.704 1.187 0 1.915.753 1.948 1.704 0 .946-.761 1.704-1.989 1.704zm1.582 11.597H3.635V9.81h3.284v10.642zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
