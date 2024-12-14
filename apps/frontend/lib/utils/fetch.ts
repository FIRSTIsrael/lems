import { WithId } from 'mongodb';
import { GetServerSidePropsContext } from 'next';
import { Division, SafeUser } from '@lems/types';

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
  const user: SafeUser = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());
  const divisions: Array<WithId<Division>> = await apiFetch(`/public/divisions`).then(res =>
    res?.json()
  );

  let divisionId = user.divisionId?.toString();
  if (divisionId) return { user, divisionId };

  const isEventUser = (user.eventId && (user.assignedDivisions?.length || 0) > 0) || user.isAdmin;
  if (!isEventUser) return { user, divisionId };

  const idFromQuery = (ctx.query.divisionId as string) || undefined;
  if (user.isAdmin && !idFromQuery) return { user, divisionId }; //Don't know what division admin wants

  const assignedDivisions = user.assignedDivisions?.map(id => id.toString()) || [];
  if (!idFromQuery) {
    divisionId = assignedDivisions
      .find(id => divisions.find(d => d._id.toString() === id)?.hasState)
      ?.toString();
    return { user, divisionId };
  }

  const canAccessDivision = assignedDivisions.includes(idFromQuery);
  if (canAccessDivision) divisionId = idFromQuery;
  return { user, divisionId };
};

export const serverSideGetRequests = async (
  toFetch: { [key: string]: string },
  ctx: GetServerSidePropsContext
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { [key: string]: any } = {};

  await Promise.all(
    Object.entries(toFetch).map(async ([key, urlPath]) => {
      const data = await apiFetch(urlPath, undefined, ctx).then(res => res?.json());
      result[key] = data;
    })
  );

  return result;
};
