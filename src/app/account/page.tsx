import { Suspense } from 'react';
import AccountPageClient from './AccountPageClient';

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="min-h-screen pt-32 px-6 text-[#8a8279] text-sm text-center">
            Loading…
          </div>
        }
      >
        <AccountPageClient />
      </Suspense>
    </main>
  );
}