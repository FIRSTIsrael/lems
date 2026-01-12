'use client';

import { SWRConfig } from 'swr';
import { z } from 'zod';
import { apiFetch } from './fetch';

interface SWRError extends Error {
  info: unknown;
  status: number;
}

type FetcherArgs = string | [string, z.ZodSchema];

export const swrFetcher = async (args: FetcherArgs) => {
  let url: string;
  let schema: z.ZodSchema | undefined;

  if (typeof args === 'string') {
    url = args;
  } else {
    [url, schema] = args;
  }

  try {
    const result = schema ? await apiFetch(url, {}, schema) : await apiFetch(url, {});

    if (!result.ok) {
      console.error('API fetch failed:', {
        url,
        status: result.status,
        statusText: result.statusText,
        error: result.error
      });
      const error = new Error(
        `API request failed: ${result.status} ${result.statusText}`
      ) as SWRError;
      error.info = result.error;
      error.status = result.status;
      throw error;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
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
