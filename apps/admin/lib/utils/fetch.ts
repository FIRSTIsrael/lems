export const getApiBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  return isSsr ? process.env.LOCAL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;
};

export const apiFetch = async (
  path: string,
  init?: RequestInit | undefined,
  cache = false
): Promise<Response> => {
  const response = fetch(getApiBase() + path, {
    credentials: 'include',
    cache: cache ? 'force-cache' : 'no-cache',
    ...init
  });
  return response;
};
