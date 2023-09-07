export const getApiBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  return isSsr ? process.env.LOCAL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;
};

export const apiFetch = (path: string, init?: RequestInit | undefined): Promise<Response> => {
  return fetch(getApiBase() + path, {
    credentials: 'include',
    ...init
  }).then(response => {
    return response;
  });
};
