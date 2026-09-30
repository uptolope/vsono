import type { Metadata } from "next";
import Link from "next/link";
import { verifyConfirmToken } from "@/lib/confirm-token";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Message({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <>
      <h1 className="display-serif mb-4 text-3xl font-semibold text-white">
        {title}
      </h1>
      <p className="body-readable mb-8 text-sm text-[#8a8279]">{body}</p>
      {cta && (
        <Link href={cta.href} className="btn-industrial px-6 py-3 text-[10px]">
          {cta.label}
        </Link>
      )}
    </>
  );
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; x?: string; status?: string }>;
}) {
  const { e = "", t = "", x = "", status } = await searchParams;
  const email = e.trim().toLowerCase();
  const check = verifyConfirmToken(email, Number(x), t);

  let content: React.ReactNode;

  if (status === "done") {
    content = (
      <Message
        title="You're confirmed"
        body="Thanks. We've sent your free diagnostic link to your inbox, and you can start it now."
        cta={{ href: "/demo", label: "START THE FREE DIAGNOSTIC" }}
      />
    );
  } else if (status === "unsubscribed") {
    content = (
      <Message
        title="You're unsubscribed"
        body="This address previously unsubscribed from SonoPrep emails, so we won't email it. The free diagnostic is still available on the site."
        cta={{ href: "/demo", label: "OPEN THE FREE DIAGNOSTIC" }}
      />
    );
  } else if (status === "expired" || (!status && check.valid && check.expired)) {
    content = (
      <Message
        title="This confirmation link has expired"
        body="Confirmation links last 7 days. Enter your email again on the site and we'll send a new one."
        cta={{ href: "/demo", label: "GO TO THE FREE DIAGNOSTIC" }}
      />
    );
  } else if (status === "error") {
    content = (
      <Message
        title="Something went wrong"
        body="We couldn't confirm your email just now. Please click the link in your email again in a minute."
      />
    );
  } else if (!status && check.valid) {
    content = (
      <>
        <h1 className="display-serif mb-4 text-3xl font-semibold text-white">
          Confirm your email
        </h1>
        <p className="body-readable mb-8 text-sm text-[#8a8279]">
          Confirm that {email} should receive the free SonoPrep SPI diagnostic
          link and up to 3 follow-up study-tip emails over about two weeks. You
          can unsubscribe from any email.
        </p>
        <form action="/api/confirm" method="post">
          <input type="hidden" name="e" value={email} />
          <input type="hidden" name="x" value={x} />
          <input type="hidden" name="t" value={t} />
          <button type="submit" className="btn-industrial px-6 py-3 text-[10px]">
            YES, CONFIRM MY EMAIL
          </button>
        </form>
      </>
    );
  } else {
    content = (
      <Message
        title="This confirmation link isn't valid"
        body="Use the link from the most recent confirmation email we sent you, or enter your email again on the site to get a new one."
      />
    );
  }

  return (
    <main className="min-h-screen px-6 pt-32 pb-24">
      <div className="mx-auto max-w-md text-center">{content}</div>
    </main>
  );
}
