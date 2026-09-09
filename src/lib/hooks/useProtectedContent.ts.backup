'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Shared data-fetching hook for the authenticated paid-content pages
 * (Exam Simulator, Physics Pearls, Study Notes). All three call the same
 * GET /api/content/[product] route and need the same loading / empty /
 * error / unauthorized states, so that logic lives here once instead of
 * being duplicated per page.
 *
 * Performs exactly one fetch when the session becomes authenticated —
 * no polling, no refetch interval, no repeated requests.
 */
export type ContentState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

export function useProtectedContent<T>(product: string) {
  const { status: sessionStatus } = useSession();
  const [state, setState] = useState<ContentState<T>>({ status: 'idle' });

  const fetchContent = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch(`/api/content/${product}`);

      if (res.status === 401) {
        setState({ status: 'unauthenticated' });
        return;
      }
      if (res.status === 403) {
        setState({ status: 'unauthorized' });
        return;
      }
      if (!res.ok) {
        setState({ status: 'error', message: 'Failed to load content. Please try again.' });
        return;
      }

      const data = (await res.json()) as T;
      setState({ status: 'success', data });
    } catch {
      setState({ status: 'error', message: 'Network error. Please check your connection and try again.' });
    }
  }, [product]);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      setState({ status: 'unauthenticated' });
      return;
    }
    if (sessionStatus === 'authenticated') {
      fetchContent();
    }
    // sessionStatus === 'loading': leave state as-is (idle), the page
    // shows its own "checking session" loading state in the meantime.
  }, [sessionStatus, fetchContent]);

  return { state, refetch: fetchContent, sessionStatus };
}
