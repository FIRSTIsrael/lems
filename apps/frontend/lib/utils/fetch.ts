import { GetServerSidePropsContext } from 'next';

const getApiBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  return isSsr ? process.env.LOCAL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;
};

export const apiFetch = (
  path: string,
  init?: RequestInit | undefined,
  ctx?: GetServerSidePropsContext
): Promise<Response> => {
  let headers = { ...init?.headers };
  if (ctx) {
    const token = ctx.req.cookies['auth-token'];
    headers = { Authorization: `Bearer ${token}`, ...init?.headers };
  }

  return fetch(getApiBase() + path, {
    credentials: 'include',
    headers,
    ...init
  }).then(response => {
    return response;
  });
};

export const serverSideGetRequests = async (
  toFetch: { [key: string]: string },
  ctx: GetServerSidePropsContext
) => {
  const result: { [key: string]: any } = {};

  await Promise.all(
    Object.entries(toFetch).map(entry => {
      apiFetch(entry[1], undefined, ctx)
        .then(res => res?.json())
        .then(data => (result[entry[0]] = data));
    })
  );

  return result;
};
