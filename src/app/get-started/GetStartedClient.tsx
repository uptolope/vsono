"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GetStartedClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (localStorage.getItem("sonoprep_lead_unlocked") === "true") {
      setUnlocked(true);
    }
  }, []);

  async function handleLeadCapture(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!response.ok) {
        throw new Error("Subscription request failed.");
      }

      localStorage.setItem("sonoprep_lead_unlocked", "true");
      localStorage.setItem("sonoprep_user_email", trimmedEmail);

      setUnlocked(true);
      router.push("/demo");
    } catch {
      setErrorMsg(
        "We could not activate access right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl text-center">
      <p className="meta text-[9px] text-[#c85b3a] mb-4">
        FREE SPI DIAGNOSTIC ACCESS
      </p>

      <h1 className="display-serif text-4xl sm:text-6xl text-white font-semibold leading-tight">
        Find the physics gaps
        <br />
        <span className="text-[#c85b3a]">before exam day.</span>
      </h1>

      <p className="body-readable text-[#8a8279] text-base sm:text-lg leading-relaxed max-w-xl mx-auto mt-5 mb-10">
        Unlock a free 10-question ARDMS SPI diagnostic test with instant
        explanations and domain feedback. No credit card required.
      </p>

      <div className="depth-border corner-arch max-w-md mx-auto p-7 bg-white/[0.02]">
        {unlocked ? (
          <div className="space-y-5">
            <p className="meta text-[9px] text-[#c85b3a]">
              ACCESS UNLOCKED
            </p>

            <h2 className="display-serif text-2xl text-white">
              Your free session is ready.
            </h2>

            <Link
              href="/demo"
              className="btn-industrial block w-full px-6 py-4"
            >
              LAUNCH DIAGNOSTIC TEST →
            </Link>

            <Link
              href="/products"
              className="btn-industrial-outline block w-full px-6 py-4"
            >
              VIEW FULL STUDY SYSTEM
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleLeadCapture}
            className="space-y-4 text-left"
          >
            <div>
              <h2 className="display-serif text-xl text-white">
                Claim instant study access
              </h2>

              <p className="body-readable text-[#8a8279] text-sm mt-2">
                Enter your email to unlock the free practice experience.
              </p>
            </div>

            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-[#0B0D10] border border-white/[0.08] text-white placeholder:text-[#4a453f] focus:outline-none focus:border-[#c85b3a]/60 focus:ring-2 focus:ring-[#c85b3a]/60"
            />

            {errorMsg && (
              <p className="text-red-400 text-xs">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-industrial w-full px-6 py-4 disabled:opacity-50"
            >
              {loading
                ? "ACTIVATING ACCESS..."
                : "UNLOCK FREE ACCESS →"}
            </button>

            <p className="meta text-[9px] text-[#4a453f] text-center">
              FREE · NO CREDIT CARD · INSTANT ACCESS
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
