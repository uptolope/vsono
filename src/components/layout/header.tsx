"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/demo", label: "Free Demo" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  // next-auth's useSession() subscribes to session changes (sign-in,
  // sign-out, token refresh) via its own internal event bus — it does
  // NOT poll on an interval by default, so this doesn't add any
  // repeated network activity. It updates automatically after sign-in,
  // sign-out, and navigation, and `status === "loading"` covers the
  // initial render before the session is known, avoiding a flash of
  // the wrong nav state.
  const { data: session, status } = useSession();

  const closeMenu = () => setOpen(false);

  const handleSignOut = () => {
    closeMenu();
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#0B0D10]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="display-serif text-lg font-bold text-white tracking-tight">
            SonoPrep
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="meta text-[11px] text-[#8a8279] hover:text-white transition-colors"
            >
              {label.toUpperCase()}
            </Link>
          ))}

          {status === "loading" ? (
            <span className="meta text-[11px] text-[#4a453f]">···</span>
          ) : status === "authenticated" ? (
            <>
              <Link
                href="/account"
                className="meta text-[11px] text-[#c2bab0] hover:text-white transition-colors"
              >
                {session?.user?.name ? session.user.name.toUpperCase() : "ACCOUNT"}
              </Link>
              <button
                onClick={handleSignOut}
                className="meta text-[11px] text-[#8a8279] hover:text-white transition-colors"
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="meta text-[11px] text-[#c2bab0] hover:text-white transition-colors"
            >
              SIGN IN
            </Link>
          )}

          <Link
            href="/products#bundle"
            className="btn-industrial px-5 py-2 text-[10px]"
          >
            GET THE BUNDLE →
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#8a8279] hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-white/[0.04] bg-[#0B0D10] px-6 pb-6 pt-4 space-y-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              className="block meta text-[11px] text-[#8a8279] hover:text-white transition-colors"
            >
              {label.toUpperCase()}
            </Link>
          ))}

          {status === "authenticated" ? (
            <>
              <Link
                href="/account"
                onClick={closeMenu}
                className="block meta text-[11px] text-[#c2bab0] hover:text-white transition-colors"
              >
                ACCOUNT
              </Link>
              <button
                onClick={handleSignOut}
                className="block meta text-[11px] text-[#8a8279] hover:text-white transition-colors"
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={closeMenu}
              className="block meta text-[11px] text-[#c2bab0] hover:text-white transition-colors"
            >
              SIGN IN
            </Link>
          )}

          <Link
            href="/products#bundle"
            onClick={closeMenu}
            className="block btn-industrial px-5 py-2 text-[10px] text-center"
          >
            GET THE BUNDLE →
          </Link>
        </div>
      )}
    </header>
  );
}
