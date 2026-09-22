'use client';

import Link from 'next/link';
import { useProtectedContent } from '@/lib/hooks/useProtectedContent';
import type { PhysicsPearl } from '@/lib/content/physics-pearls-data';

interface PhysicsPearlsResponse {
  pearls: PhysicsPearl[];
  expiresAt: string | null;
}

export default function PhysicsPearlsPage() {
  const { state, refetch } = useProtectedContent<PhysicsPearlsResponse>('PHYSICS_PEARLS');

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm">Loading Physics Pearls</p>
      </Centered>
    );
  }

  if (state.status === 'unauthenticated') {
    return (
      <Centered>
        <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold mb-4">
          Sign in required
        </h1>
        <p className="body-readable text-[#8a8279] text-sm mb-8">
          Please log in to access Physics Pearls.
        </p>
        <Link href="/login" className="btn-industrial px-6 py-3 text-[10px]">
          SIGN IN
        </Link>
      </Centered>
    );
  }

  if (state.status === 'unauthorized') {
    return (
      <Centered>
        <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold mb-4">
          Purchase required
        </h1>
        <p className="body-readable text-[#8a8279] text-sm mb-8">
          You don&apos;t have an active Physics Pearls purchase. Grab it (or the
          Premium Bundle) to unlock this content.
        </p>
        <Link href="/products" className="btn-industrial px-6 py-3 text-[10px]">
          BROWSE PRODUCTS
        </Link>
      </Centered>
    );
  }

  if (state.status === 'error') {
    return (
      <Centered>
        <p className="text-[#c85b3a] text-sm mb-6">{state.message}</p>
        <button onClick={refetch} className="btn-industrial px-6 py-3 text-[10px]">
          RELOAD
        </button>
      </Centered>
    );
  }

  const { pearls, expiresAt } = state.data;

  if (!pearls || pearls.length === 0) {
    return (
      <Centered>
        <p className="text-[#8a8279] text-sm mb-6">
          No Physics Pearls are available right now. Check back soon.
        </p>
      </Centered>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/account"
          className="meta text-[10px] text-[#4a453f] hover:text-[#c85b3a] mb-8 inline-block transition-colors"
        >
          BACK TO ACCOUNT
        </Link>

        <div className="mb-10">
          <span className="meta text-[#c85b3a] text-sm">STUDY</span>
          <h1 className="display-serif text-3xl sm:text-4xl text-white mt-3 font-semibold">
            Physics Pearls
          </h1>
          <p className="body-readable text-[#8a8279] text-sm mt-2">
            {pearls.length} high-yield concepts
            {expiresAt && (
              <span className="ml-2">
                Access until {new Date(expiresAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <ol className="space-y-4">
          {pearls.map((pearl, i) => (
            <li
              key={pearl.id}
              className="border border-white/[0.06] rounded p-5 flex gap-4"
            >
              <span className="meta text-[10px] text-[#c85b3a] shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="body-readable text-[#c2bab0] text-sm leading-relaxed">
                {pearl.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-32 px-6 pb-24">
      <div className="max-w-2xl mx-auto text-center">{children}</div>
    </div>
  );
}
