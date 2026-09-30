import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen flex items-center justify-center"
        >
          <div className="text-white">Loading...</div>
        </main>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}