"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.fieldErrors) {
          const msgs = Object.values(data.error.fieldErrors).flat();
          setError((msgs as string[]).join(" "));
        } else {
          setError(data.error || "Something went wrong.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="display-serif text-xl font-semibold text-white mb-4">Invalid reset link</h1>
          <p className="text-[#8a8279] text-sm mb-6">
            This password reset link is missing required information. Please request a new one.
          </p>
          <Link href="/forgot-password" className="btn-industrial inline-block py-3 px-8 text-[11px]">
            REQUEST NEW LINK →
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="display-serif text-xl font-semibold text-white mb-2">Password reset</h1>
          <p className="text-[#8a8279] text-sm mb-6">
            Your password has been changed. You can now sign in with your new password.
          </p>
          <Link href="/login" className="btn-industrial inline-block w-full py-3 text-[11px] text-center">
            SIGN IN →
          </Link>
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
          <p className="meta text-[10px] text-[#4a453f] mt-3">SET NEW PASSWORD</p>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/30 bg-red-500/[0.08] p-4 rounded">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="meta text-[9px] text-[#4a453f] block mb-1.5">
              NEW PASSWORD
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0D10] border border-white/[0.08] text-white placeholder:text-[#3a3530] text-sm rounded focus:outline-none focus:border-[#c85b3a]/40"
              placeholder="••••••••••"
            />
            <p className="meta text-[9px] text-[#3a3530] mt-1.5">
              At least 10 characters · uppercase · lowercase · number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="meta text-[9px] text-[#4a453f] block mb-1.5">
              CONFIRM PASSWORD
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              minLength={10}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0D10] border border-white/[0.08] text-white placeholder:text-[#3a3530] text-sm rounded focus:outline-none focus:border-[#c85b3a]/40"
              placeholder="••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-industrial w-full py-3 text-[11px] disabled:opacity-50"
          >
            {loading ? "RESETTING…" : "RESET PASSWORD →"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="meta text-[9px] text-[#3a3530] hover:text-[#8a8279] transition-colors"
          >
            ← BACK TO SIGN IN
          </Link>
        </div>
      </div>
    </div>
  );
}
