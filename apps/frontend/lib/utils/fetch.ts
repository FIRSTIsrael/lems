import { ObjectId, WithId } from 'mongodb';
import { GetServerSidePropsContext } from 'next';
import { Division } from '@lems/types';

export const getApiBase = (forceClient = false) => {
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
    let token: string | undefined = undefined;
    const authHeader = ctx.req.headers.authorization as string;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    } else {
      token = ctx.req.cookies?.['auth-token'];
    }
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

export const getUserAndDivision = async (ctx: GetServerSidePropsContext) => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());
  const divisions: Array<WithId<Division>> = await apiFetch(`/public/divisions`).then(res =>
    res?.json()
  );
  let divisionId = user.divisionId;
  if (!divisionId && user.eventId && user.assignedDivisions.length > 0) {
    const idFromQuery = (ctx.query.divisionId as string) || undefined;
    if (user.assignedDivisions.includes(idFromQuery)) {
      divisionId = idFromQuery;
    } else {
      divisionId = user.assignedDivisions.filter(
        (id: ObjectId) => divisions.find(d => d._id === id)?.hasState
      )[0];
    }
  }
  return { user, divisionId };
};

export const serverSideGetRequests = async (
  toFetch: { [key: string]: string },
  ctx: GetServerSidePropsContext
) => {
  const result: { [key: string]: any } = {};

  await Promise.all(
    Object.entries(toFetch).map(async ([key, urlPath]) => {
      const data = await apiFetch(urlPath, undefined, ctx).then(res => res?.json());
      result[key] = data;
    })
  );

  return result;
};
