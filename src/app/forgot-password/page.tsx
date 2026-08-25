"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (res.status === 429) {
        setError("Too many requests. Please wait a few minutes and try again.");
        return;
      }

      // Always show success regardless of whether email exists (anti-enumeration)
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#c85b3a]/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#c85b3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="display-serif text-xl font-semibold text-white mb-2">Check your email</h1>
            <p className="text-[#8a8279] text-sm leading-relaxed">
              If an account with that email exists, we&apos;ve sent a password reset link. 
              Check your inbox (and spam folder) — the link expires in 1 hour.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/login"
              className="btn-industrial inline-block w-full py-3 text-[11px] text-center"
            >
              BACK TO SIGN IN →
            </Link>
            <button
              onClick={() => { setSubmitted(false); setEmail(""); }}
              className="block w-full text-[#4a453f] text-xs hover:text-[#8a8279] transition-colors"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="display-serif text-2xl font-bold text-white tracking-tight">
            SonoPrep
          </Link>
          <p className="meta text-[10px] text-[#4a453f] mt-3">RESET YOUR PASSWORD</p>
        </div>

        <p className="text-[#8a8279] text-sm mb-6 text-center leading-relaxed">
          Enter the email address on your account. We&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-6 border border-red-500/30 bg-red-500/[0.08] p-4 rounded">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="meta text-[9px] text-[#4a453f] block mb-1.5">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0D10] border border-white/[0.08] text-white placeholder:text-[#3a3530] text-sm rounded focus:outline-none focus:border-[#c85b3a]/40"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-industrial w-full py-3 text-[11px] disabled:opacity-50"
          >
            {loading ? "SENDING…" : "SEND RESET LINK →"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#8a8279] text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-[#c85b3a] hover:text-[#e06840] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="meta text-[9px] text-[#3a3530] hover:text-[#8a8279] transition-colors"
          >
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
