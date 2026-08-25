'use client';

import dynamicImport from 'next/dynamic';

const AccountPageClient = dynamicImport(() => import('./AccountPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen pt-32 px-6 text-[#8a8279] text-sm text-center">
      Loading…
    </div>
  ),
});

export default function AccountPage() {
  return <AccountPageClient />;
}