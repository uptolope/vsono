'use client';
import React from 'react';
import Link from 'next/link';

export default function VerifiedPage(): React.ReactNode {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-green-600 mb-4">✓</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Email Verified!
        </h2>
        <p className="text-gray-600 mb-6">
          Your email has been successfully verified. You can now log in to your
          account.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}