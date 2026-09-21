import React, { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage(): React.ReactNode {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          className="min-h-screen flex items-center justify-center bg-gray-900"
        >
          <div className="text-white">Loading...</div>
        </main>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}