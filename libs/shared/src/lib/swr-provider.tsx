'use client';

import { SWRConfig } from 'swr';
import { apiFetch } from './fetch';

interface SWRError extends Error {
  info: unknown;
  status: number;
}

const swrFetcher = async (url: string) => {
  const result = await apiFetch(url);
  if (!result.ok) {
    const error = new Error('An error occurred while fetching the data.') as SWRError;
    error.info = result.error;
    error.status = result.status;
    throw error;
  }
  return result.data;
};

interface SWRProviderProps {
  children: React.ReactNode;
}

export const SWRProvider: React.FC<SWRProviderProps> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 60000, // 1 minute
        focusThrottleInterval: 5000
      }}
    >
      {children}
    </SWRConfig>
  );
};
