import { PortalEvent } from '@lems/types';

const getApiBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  const url = isSsr ? process.env.LOCAL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;
  return url + '/public/portal';
};

const apiFetch = async (path: string, init?: RequestInit | undefined): Promise<Response> => {
  const headers = { ...init?.headers };
  const response = await fetch(getApiBase() + path, {
    headers,
    ...init
  });

  if (!response.ok) throw new Error(`Failed to fetch ${path}`);

  return response;
};

export const fetchEvents = async (): Promise<PortalEvent[]> => {
  const res = await apiFetch('/events');
  const data = await res.json();
  return data as PortalEvent[];
};
