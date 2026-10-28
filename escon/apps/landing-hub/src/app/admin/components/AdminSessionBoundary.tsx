'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAdminAction } from '../actions';

export function AdminSessionBoundary({
  clearOnMount = false,
}: {
  clearOnMount?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (clearOnMount) {
      logoutAdminAction().catch(() => {});
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (clearOnMount) {
        logoutAdminAction().catch(() => {});
      } else if (event.persisted) {
        router.refresh();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [clearOnMount, router]);

  return null;
}
