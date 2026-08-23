import Link from "next/link";

export default function VerifiedPage() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>✅ Email Verified!</h1>
      <p>Your email has been successfully verified.</p>
      <p>You can now log in to your account.</p>
      <Link href="/login">
        <button style={{ padding: "10px 20px", fontSize: "16px" }}>
          Go to Login
        </button>
      </Link>
    </div>
  );
}