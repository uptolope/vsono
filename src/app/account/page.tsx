'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AccountPageClient = dynamic(() => import('./AccountPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen pt-32 px-6 text-[#8a8279] text-sm text-center">
      Loading…
    </div>
  ),
});

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 px-6 text-[#8a8279] text-sm text-center">Loading…</div>}>
      <AccountPageClient />
    </Suspense>
  );
}