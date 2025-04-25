import useSWR from 'swr';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/public/portal`;

const fetcher = (path: string, init?: RequestInit | undefined) => {
  const headers = { ...init?.headers };
  return fetch(BASE_URL + path, {
    headers,
    ...init
  }).then(response => response.json());
};

export const useRealtimeData = <T>(path: string, init?: RequestInit | undefined) => {
  const { data, isLoading, error } = useSWR(path, fetcher, {
    refreshInterval: 90000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return { data: data as T, isLoading, error };
};
