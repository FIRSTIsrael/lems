import useSWR from 'swr';
import { apiFetch } from '@lems/shared';

const BASE_URL = `/api/portal`;

const fetcher = (path: string, init?: RequestInit) => {
  return apiFetch(BASE_URL + path, init);
};

/**
 * Hook for fetching real-time portal data with automatic refresh.
 * Configured to poll every 90 seconds to keep data up-to-date during live events.
 *
 * @param path - API path relative to /api/portal (e.g., "/divisions/123/scoreboard")
 * @param init - Optional fetch configuration
 * @returns SWR response with data, loading state, and error
 */
export const useRealtimePortalData = <T>(path: string, init?: RequestInit) => {
  const fetcherWithInit = (url: string) => fetcher(url, init);

  const { data, isLoading, error, mutate } = useSWR(path, fetcherWithInit, {
    refreshInterval: 90000, // 90 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true
  });

  return { data: data as T, isLoading, error, mutate };
};
