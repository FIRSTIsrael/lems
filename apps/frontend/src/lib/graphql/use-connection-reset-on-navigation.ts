import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useConnectionState } from './apollo-client-provider';

/**
 * Hook that resets the GraphQL connection
 * when navigating between pages or changing division.
 * Locale changes are detected via pathname changes.
 */
export function useConnectionResetOnNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const divisionId = searchParams.get('divisionId');
  const { resetConnection } = useConnectionState();

  // Track previous values to avoid initial reset on mount and prevent cascading resets
  const prevPathRef = useRef<string | null>(null);
  const prevDivisionRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip reset on initial mount
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }

    // Only reset if pathname actually changed (locale is part of pathname)
    if (prevPathRef.current !== pathname) {
      console.log('[Navigation] Pathname/locale changed:', prevPathRef.current, '->', pathname);
      prevPathRef.current = pathname;
      resetConnection();
    }
  }, [pathname, resetConnection]);

  useEffect(() => {
    // Skip on initial mount
    if (prevDivisionRef.current === undefined) {
      prevDivisionRef.current = divisionId;
      return;
    }

    // Only reset if divisionId changed between non-null values
    // (null->value is initial load, not a navigation)
    if (
      prevDivisionRef.current !== null &&
      divisionId !== null &&
      prevDivisionRef.current !== divisionId
    ) {
      console.log('[Navigation] Division ID changed:', prevDivisionRef.current, '->', divisionId);
      prevDivisionRef.current = divisionId;
      resetConnection();
    } else {
      prevDivisionRef.current = divisionId;
    }
  }, [divisionId, resetConnection]);
}
