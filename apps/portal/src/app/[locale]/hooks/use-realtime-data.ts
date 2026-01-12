import useSWR, { SWRConfiguration } from 'swr';
import { swrFetcher } from '@lems/shared';

/**
 * Hook for fetching real-time portal data with automatic refresh.
 * Configured to poll every 90 seconds to keep data up-to-date during live events.
 *
 * @param path - API path (e.g., "/portal/divisions/123/scoreboard")
 * @param swrConfig - Optional SWR configuration. See https://swr.vercel.app/docs/configuration for details.
 * @returns SWR response with data, loading state, and error
 */
export const useRealtimeData = <T>(path: string, swrConfig?: SWRConfiguration) => {
  const { data, isLoading, error, mutate } = useSWR(path, swrFetcher, {
    ...swrConfig,
    refreshInterval: 90000, // 90 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true
  });

  return { data: data as T, isLoading, error, mutate };
};
