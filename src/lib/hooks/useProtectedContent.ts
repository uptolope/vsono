'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

export type ContentState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

export function useProtectedContent<T>(
  product: string,
  enabled = true,
) {
  const { status: sessionStatus } = useSession();

  const [state, setState] = useState<ContentState<T>>({
    status: 'idle',
  });

  const hasFetchedRef = useRef(false);

  const fetchContent = useCallback(async () => {
    hasFetchedRef.current = true;
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
        setState({
          status: 'error',
          message: 'Failed to load content. Please try again.',
        });
        return;
      }

      const data = (await res.json()) as T;
      setState({ status: 'success', data });
    } catch {
      setState({
        status: 'error',
        message:
          'Network error. Please check your connection and try again.',
      });
    }
  }, [product]);

  useEffect(() => {
    if (!enabled) {
      hasFetchedRef.current = false;
      return;
    }

    if (sessionStatus === 'unauthenticated') {
      setState({ status: 'unauthenticated' });
      return;
    }

    if (
      sessionStatus === 'authenticated' &&
      !hasFetchedRef.current
    ) {
      fetchContent();
    }
  }, [sessionStatus, enabled, fetchContent]);

  return {
    state,
    refetch: fetchContent,
    sessionStatus,
  };
}
