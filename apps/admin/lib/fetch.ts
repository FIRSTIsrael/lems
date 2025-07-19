import { z } from 'zod';

export const getApiBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  return isSsr ? process.env.LOCAL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;
};

/**
 * Makes a type-safe API request with optional Zod schema validation,
 * and handles authentication automatically based on the environment.
 *
 * @param path - The API endpoint path (e.g., '/api/users')
 * @param init - Optional RequestInit options for the fetch request
 * @param schema - Optional Zod schema for response validation and type inference
 *
 * @returns Promise with response and parsed data
 *
 * @example
 * // Simple GET request without validation
 * const { data } = await apiFetch('/api/users');
 * // data is typed as 'unknown'
 *
 * @example
 * // GET request with schema validation
 * const userSchema = z.object({
 *   id: z.number(),
 *   name: z.string(),
 *   email: z.string().email()
 * });
 * const { data } = await apiFetch('/api/users', undefined, userSchema);
 * // data is strongly typed as { id: number; name: string; email: string }
 *
 *
 * @throws {Error} When the API request fails (non-2xx status)
 * @throws {Error} When JSON parsing fails
 * @throws {Error} When Zod schema validation fails (if schema provided)
 */
export async function apiFetch<TSchema extends z.ZodTypeAny>(
  path: string,
  init: RequestInit | undefined,
  schema: TSchema
): Promise<{
  response: Response;
  data: z.infer<TSchema>;
}>;

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<{
  response: Response;
  data: unknown;
}>;

export async function apiFetch<TSchema extends z.ZodTypeAny>(
  path: string,
  init?: RequestInit,
  schema?: TSchema
): Promise<{
  response: Response;
  data: z.infer<TSchema>;
}> {
  const isServer = typeof window === 'undefined';

  let fetchOptions: RequestInit = {
    cache: 'no-cache', // Disable caching by default
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

    if (schema) {
      const parsedData = schema.parse(json);
      return { response, data: parsedData } as { response: Response; data: z.infer<TSchema> };
    } else {
      return { response, data: json } as { response: Response; data: z.infer<TSchema> };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Response validation failed: ${error.message}`);
    }
    throw new Error(`Failed to parse JSON response: ${error}`);
  }
}
