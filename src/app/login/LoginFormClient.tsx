"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackLogin } from "@/lib/analytics";

export default function LoginFormClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const justVerified = searchParams.get("verified") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent"
  >("idle");

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
          setError(
            "Too many login attempts from this connection. Try again in a few minutes."
          );
        } else {
          setError("Invalid email or password.");
        }
      } else if (result?.url) {
        trackLogin();
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
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });
    } catch {
      // Do not reveal whether an account exists.
    } finally {
      setResendState("sent");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <h1 className="sr-only">Sign in to SonoPrep</h1>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="display-serif text-2xl font-bold tracking-tight text-white"
          >
            SonoPrep
          </Link>

          <p className="mt-3 text-[10px] font-medium tracking-[0.12em] text-white">
            SIGN IN TO YOUR ACCOUNT
          </p>
        </div>

        {justVerified && !error && (
          <div className="mb-6 rounded border border-[#c85b3a]/30 bg-[#c85b3a]/[0.08] p-4">
            <p className="text-sm text-[#e06840]">
              Email verified – you can log in now.
            </p>
          </div>
        )}

        {error && (
          <div
            className="mb-6 rounded border border-red-500/30 bg-red-500/[0.08] p-4"
            role="alert"
          >
            <p className="text-sm text-red-400">{error}</p>

            {needsVerification && (
              <div className="mt-2">
                {resendState === "sent" ? (
                  <p className="text-xs text-red-300/80">
                    If that account needs verification, a new email is on its
                    way.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendState === "sending"}
                    className="text-xs text-red-300 underline underline-offset-2 transition-colors hover:text-red-200 disabled:opacity-50"
                  >
                    {resendState === "sending"
                      ? "Sending…"
                      : "Resend verification email"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[9px] font-medium tracking-[0.12em] text-white"
            >
              EMAIL
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-white/[0.08] bg-[#0B0D10] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8a8279] focus:border-[#c85b3a]/40 focus:ring-2 focus:ring-[#c85b3a]/50"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[9px] font-medium tracking-[0.12em] text-white"
            >
              PASSWORD
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-white/[0.08] bg-[#0B0D10] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8a8279] focus:border-[#c85b3a]/40 focus:ring-2 focus:ring-[#c85b3a]/50"
              placeholder="••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#c85b3a] px-4 py-3 text-[11px] font-semibold tracking-[0.12em] text-black transition-colors hover:bg-[#e06840] focus:outline-none focus:ring-2 focus:ring-[#e06840] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "SIGNING IN…" : "SIGN IN →"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-[#8a8279]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#c85b3a] underline underline-offset-2 transition-colors hover:text-[#e06840]"
            >
              Sign up
            </Link>
          </p>

          <p className="text-xs text-[#b8afa5]">
            <Link
              href="/forgot-password"
              className="text-[#b8afa5] underline underline-offset-2 transition-colors hover:text-white"
            >
              Forgot your password?
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-[9px] font-medium tracking-[0.12em] text-white underline underline-offset-2 transition-colors hover:text-white"
          >
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </main>
  );
}