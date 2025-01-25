import { PortalEvent, PortalTeam } from '@lems/types';

const getApiBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  const url = isSsr ? process.env.LOCAL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;
  return url + '/public/portal';
};

const apiFetch = async (path: string, init?: RequestInit | undefined) => {
  const headers = { ...init?.headers };
  const response = await fetch(getApiBase() + path, {
    headers,
    ...init
  });

  if (!response.ok) throw new Error(`Failed to fetch ${path}`);

  const data = await response.json();
  return data;
};

export const fetchEvents = async (): Promise<PortalEvent[]> => {
  const events: PortalEvent[] = await apiFetch('/events');
  return events;
};

export const fetchEvent = async (id: string) => {
  const event: PortalEvent = await apiFetch(`/events/${id}`);
  const teams: PortalTeam[] = await apiFetch(`/events/${id}/teams`);
  return { event, teams };
};
