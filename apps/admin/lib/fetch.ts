export const getApiBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  return isSsr ? process.env.LOCAL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;
};

export const apiFetch = async <T>(
  path: string,
  init?: RequestInit,
  cache = false
): Promise<{
  response: Response;
  data: T;
}> => {
  const isServer = typeof window === 'undefined';

  let fetchOptions: RequestInit = {
    cache: cache ? 'force-cache' : 'no-cache',
    ...init
  };

  if (isServer) {
    // Server-side: Get cookies from Next.js headers and forward them
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    fetchOptions.headers = {
      Cookie: cookieHeader,
      ...init?.headers
    };
  } else {
    // Client-side: Use credentials include to send cookies automatically
    fetchOptions.credentials = 'include';
  }

  const response = await fetch(getApiBase() + path, fetchOptions);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  try {
    const json = await response.json();
    return { response, data: json as T };
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`);
  }
};
