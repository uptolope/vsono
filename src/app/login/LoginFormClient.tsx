"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginFormClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setResendState("idle");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        if (result.error === "ACCOUNT_LOCKED") {
          setError(
            "This account is temporarily locked due to too many failed attempts. Try again in 15 minutes."
          );
        } else if (result.error === "EMAIL_NOT_VERIFIED") {
          setError("Please verify your email address before signing in.");
          setNeedsVerification(true);
        } else if (result.error === "LOGIN_RATE_LIMITED") {
          setError("Too many login attempts from this connection. Try again in a few minutes.");
        } else {
          setError("Invalid email or password.");
        }
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendState("sending");
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
    } catch {
      // Fall through to the generic "sent" state either way — this
      // endpoint deliberately never reveals success/failure per-account.
    } finally {
      setResendState("sent");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="display-serif text-2xl font-bold text-white tracking-tight">
            SonoPrep
          </Link>
          <p className="meta text-[10px] text-[#4a453f] mt-3">SIGN IN TO YOUR ACCOUNT</p>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/30 bg-red-500/[0.08] p-4 rounded">
            <p className="text-red-400 text-sm">{error}</p>
            {needsVerification && (
              <div className="mt-2">
                {resendState === "sent" ? (
                  <p className="text-red-300/80 text-xs">
                    If that account needs verification, a new email is on its way.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendState === "sending"}
                    className="text-red-300 text-xs underline hover:text-red-200 transition-colors disabled:opacity-50"
                  >
                    {resendState === "sending" ? "Sending…" : "Resend verification email"}
                  </button>
                )}
              </div>
            )}
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

          <div>
            <label htmlFor="password" className="meta text-[9px] text-[#4a453f] block mb-1.5">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0D10] border border-white/[0.08] text-white placeholder:text-[#3a3530] text-sm rounded focus:outline-none focus:border-[#c85b3a]/40"
              placeholder="••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-industrial w-full py-3 text-[11px] disabled:opacity-50"
          >
            {loading ? "SIGNING IN…" : "SIGN IN →"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-[#8a8279] text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#c85b3a] hover:text-[#e06840] transition-colors">
              Sign up
            </Link>
          </p>
          <p className="text-[#4a453f] text-xs">
            <Link href="/forgot-password" className="hover:text-[#8a8279] transition-colors">
              Forgot your password?
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
