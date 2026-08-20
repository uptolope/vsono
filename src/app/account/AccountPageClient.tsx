"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PurchaseInfo {
  product: string;
  status: string;
  amountPaidCents: number | null;
  accessGrantedAt: string | null;
  accessExpiresAt: string | null;
  createdAt: string;
}

const PRODUCT_LABELS: Record<string, string> = {
  FLASHCARDS: "SPI Flashcards",
  EXAM_SIMULATOR: "Exam Simulator",
  PHYSICS_PEARLS: "Physics Pearls",
  STUDY_NOTES: "Study Notes",
  PREMIUM_BUNDLE: "Premium Bundle",
};

function daysUntil(dateStr: string): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );
}

export default function AccountPageClient() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const justPurchased = searchParams.get("purchase") === "success";

  const [purchases, setPurchases] = useState<PurchaseInfo[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account/data")
      .then((r) => r.json())
      .then((data) => {
        if (data.export?.purchases) {
          setPurchases(data.export.purchases);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [status]);

  const handleExport = async () => {
    const res = await fetch("/api/account/data");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sonoprep-data-export-\${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    setDeleteError("");
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: deleteConfirmEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Deletion failed.");
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleteError("Something went wrong.");
    } finally {
      setDeleting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-32 px-6 text-[#8a8279] text-sm text-center">
        Loading…
      </div>
    );
  }

  const activePurchases = purchases.filter(
    (p) =>
      p.status === "COMPLETED" &&
      p.accessExpiresAt &&
      new Date(p.accessExpiresAt) > new Date()
  );

  return (
    <div className="min-h-screen pt-28 px-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] mb-8 inline-block transition-colors"
        >
          ← BACK TO HOME
        </Link>

        {/* Header */}
        <div className="mb-10">
          <span className="meta text-[#c85b3a] text-sm">ACCOUNT</span>
          <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold">
            Welcome back
            {session?.user?.name ? `, \${session.user.name}` : ""}.
          </h1>
          <p className="body-readable text-[#8a8279] text-sm mt-2">
            {session?.user?.email}
          </p>
        </div>

        {/* Purchase success banner */}
        {justPurchased && (
          <div className="mb-8 border border-green-500/30 bg-green-500/[0.08] p-5 rounded">
            <p className="display-serif text-lg font-semibold text-white mb-1">
              Purchase complete!
            </p>
            <p className="body-small text-[#c2bab0] text-sm">
              Your content is unlocked and ready. Access it below.
            </p>
          </div>
        )}

        {/* Active products */}
        <section className="mb-10">
          <h2 className="meta text-[10px] text-[#4a453f] mb-4">
            YOUR PRODUCTS
          </h2>
          {loadingData ? (
            <p className="text-[#8a8279] text-sm">Loading…</p>
          ) : activePurchases.length === 0 ? (
            <div className="border border-white/[0.06] p-6 rounded text-center">
              <p className="text-[#8a8279] text-sm mb-4">
                No active products yet.
              </p>
              <Link href="/products" className="btn-industrial px-6 py-3 text-[10px]">
                BROWSE PRODUCTS →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activePurchases.map((p, i) => {
                const days = p.accessExpiresAt
                  ? daysUntil(p.accessExpiresAt)
                  : 0;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between border border-white/[0.06] p-5 rounded"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {PRODUCT_LABELS[p.product] ?? p.product}
                      </p>
                      <p className="meta text-[9px] text-[#4a453f] mt-1">
                        {days > 0 ? `\${days} days remaining` : "Expired"}
                      </p>
                    </div>
                    <span
                      className={`meta text-[9px] px-2 py-1 rounded \${
                        days > 14
                          ? "text-green-400 bg-green-500/10"
                          : days > 0
                          ? "text-[#c85b3a] bg-[#c85b3a]/10"
                          : "text-red-400 bg-red-500/10"
                      }`}
                    >
                      {days > 0 ? "ACTIVE" : "EXPIRED"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Account actions */}
        <section className="border-t border-white/[0.04] pt-8 space-y-4">
          <h2 className="meta text-[10px] text-[#4a453f] mb-4">
            ACCOUNT ACTIONS
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="btn-industrial-outline px-5 py-2.5 text-[10px]"
            >
              EXPORT MY DATA
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn-industrial-outline px-5 py-2.5 text-[10px]"
            >
              SIGN OUT
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 text-[10px] meta border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors rounded"
            >
              DELETE ACCOUNT
            </button>
          </div>
        </section>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
            <div className="bg-[#0B0D10] border border-white/[0.06] p-8 rounded max-w-md w-full">
              <h3 className="display-serif text-xl font-semibold text-white mb-3">
                Delete your account?
              </h3>
              <p className="body-small text-[#8a8279] text-sm mb-6 leading-relaxed">
                This action is irreversible. Your account will be deactivated
                immediately and all personal data will be anonymized. Purchase
                records are retained for tax/legal purposes.
              </p>

              {deleteError && (
                <div className="mb-4 border border-red-500/30 bg-red-500/[0.08] p-3 rounded">
                  <p className="text-red-400 text-sm">{deleteError}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="meta text-[9px] text-[#4a453f] block mb-1.5">
                  TYPE YOUR EMAIL TO CONFIRM
                </label>
                <input
                  type="email"
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0D10] border border-white/[0.08] text-white text-sm rounded focus:outline-none focus:border-red-500/40"
                  placeholder={session?.user?.email ?? "your@email.com"}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmEmail("");
                    setDeleteError("");
                  }}
                  className="btn-industrial-outline flex-1 py-3 text-[10px]"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 text-[10px] meta bg-red-600 text-white hover:bg-red-700 rounded disabled:opacity-50 transition-colors"
                >
                  {deleting ? "DELETING…" : "DELETE PERMANENTLY"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
