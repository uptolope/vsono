'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface ProtectedContentState<T> {
  status: 'idle' | 'loading' | 'success' | 'error' | 'unauthenticated' | 'unauthorized';
  data: T;
  message?: string;
}

/**
 * Hook to fetch and manage protected content with access control.
 * Handles authentication, authorization, and access logging.
 */
export function useProtectedContent<T>(
  contentType: 'EXAM_SIMULATOR' | 'STUDY_NOTES' | 'FLASHCARDS',
  shouldFetch: boolean = true,
) {
  const { data: session, status: sessionStatus } = useSession();
  const [state, setState] = useState<ProtectedContentState<T>>({
    status: 'idle',
    data: {} as T,
  });

  const refetch = () => {
    if (shouldFetch && session?.user) {
      fetchProtectedContent();
    }
  };

  const fetchProtectedContent = async () => {
    if (!session?.user) {
      setState({
        status: 'unauthenticated',
        data: {} as T,
        message: 'Please sign in to access this content.',
      });
      return;
    }

    setState({ status: 'loading', data: {} as T });

    try {
      const endpoint = `/api/protected/\${contentType.toLowerCase()}`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      // Log access for audit trail
      console.log(`[Protected Content] Fetching \${contentType} for \${session.user.email}`);

      if (res.status === 401) {
        setState({
          status: 'unauthenticated',
          data: {} as T,
          message: 'Your session has expired. Please sign in again.',
        });
        return;
      }

      if (res.status === 403) {
        setState({
          status: 'unauthorized',
          data: {} as T,
          message: 'You do not have access to this content.',
        });
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP \${res.status}`);
      }

      const data = (await res.json()) as T;
      setState({
        status: 'success',
        data,
      });
    } catch (error) {
      setState({
        status: 'error',
        data: {} as T,
        message: error instanceof Error ? error.message : 'Failed to load content.',
      });
    }
  };

  useEffect(() => {
    if (shouldFetch && session?.user) {
      fetchProtectedContent();
    }
  }, [shouldFetch, session?.user]);

  return {
    state,
    refetch,
    sessionStatus,
    user: session?.user,
  };
}
