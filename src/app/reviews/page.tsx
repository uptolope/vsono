import Link from "next/link";
import { getServerSession } from "next-auth";
import ReviewForm from "./ReviewForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews",
  description: "See what SonoPrep students say about their study experience.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const [reviews, session] = await Promise.all([
    prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        body: true,
        displayName: true,
        createdAt: true,
      },
    }),
    getServerSession(authOptions),
  ]);

  return (
    <main className="min-h-screen bg-[#f3efe8] px-6 py-24 text-[#24211e]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9b6a2c]">
            Student feedback
          </p>

          <h1 className="mb-5 text-4xl font-semibold tracking-tight md:text-5xl">
            Reviews from SonoPrep students
          </h1>

          <p className="text-lg leading-8 text-[#6e675f]">
            Real experiences from students using SonoPrep to prepare for the SPI
            exam.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="mb-12 border border-dashed border-[#cfc7bb] p-8 text-[#6e675f]">
            No approved reviews yet. Be the first to share your experience.
          </div>
        ) : (
          <section className="mb-16 grid gap-5 md:grid-cols-2">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="border border-[#d8d0c5] bg-white p-6"
              >
                <div className="mb-4 text-xl tracking-wide text-[#c88935]">
                  {"★".repeat(review.rating)}
                  <span className="text-[#d7d0c5]">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </div>

                <p className="mb-6 whitespace-pre-wrap leading-7 text-[#403a34]">
                  “{review.body}”
                </p>

                <p className="text-sm font-medium text-[#6e675f]">
                  {review.displayName || "Verified SonoPrep student"}
                </p>
              </article>
            ))}
          </section>
        )}

        <section className="max-w-2xl">
          {session ? (
            <ReviewForm />
          ) : (
            <div className="border border-[#d8d0c5] bg-[#f8f5ef] p-6">
              <h2 className="mb-2 text-xl font-semibold">Have an experience to share?</h2>
              <p className="mb-5 text-sm leading-6 text-[#6e675f]">
                Sign in with the account you used to purchase SonoPrep to leave a
                verified review.
              </p>
              <Link
                href="/login?callbackUrl=/reviews"
                className="inline-block bg-[#24211e] px-5 py-3 text-sm font-medium text-white hover:bg-[#403a34]"
              >
                Sign in to leave a review
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
