import { z } from 'zod';

export const getApiBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  return isSsr ? process.env.LOCAL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;
};

export class ApiFetchError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;
  public readonly response: Response;
  public readonly responseData?: unknown;

  constructor(message: string, response: Response, responseData?: unknown) {
    super(message);
    this.name = 'ApiFetchError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
    this.response = response;
    this.responseData = responseData;
  }
}

type ApiResult<TSchema extends z.ZodTypeAny = z.ZodUnknown, Typed extends boolean = false> =
  | {
      ok: true;
      response: Response;
      data: Typed extends true ? z.infer<TSchema> : unknown;
    }
  | {
      ok: false;
      response: Response;
      status: number;
      statusText: string;
      error: unknown;
    };

/**
 * Makes a type-safe API request with optional Zod schema validation,
 * and handles authentication automatically based on the environment.
 *
 * When the response is not successful (non-2xx), it returns the response
 * and any error data instead of throwing, allowing callers to handle
 * errors appropriately.
 *
 * @param path - The API endpoint path (e.g., '/api/users')
 * @param init - Optional RequestInit options for the fetch request
 * @param schema - Optional Zod schema for response validation and type inference
 *
 * @returns Promise with response, success status, and parsed data or error info
 *
 * @example
 * // Simple GET request without validation
 * const result = await apiFetch('/api/users');
 * if (result.ok) {
 *   console.log(result.data); // success data
 * } else {
 *   console.error(result.status, result.error); // error handling
 * }
 *
 * @example
 * // GET request with schema validation
 * const userSchema = z.object({
 *   id: z.number(),
 *   name: z.string(),
 *   email: z.string().email()
 * });
 * const result = await apiFetch('/api/users', undefined, userSchema);
 * if (result.ok) {
 *   console.log(result.data); // strongly typed success data
 * } else {
 *   console.error(result.status, result.error); // error handling
 * }
 *
 * @throws {ApiFetchError} Only when network errors occur or JSON parsing fails for successful responses
 * @throws {Error} When Zod schema validation fails (if schema provided)
 */
export type ApiFetchOptions = RequestInit & {
  responseType?: 'json' | 'binary';
};

export async function apiFetch<TSchema extends z.ZodTypeAny>(
  path: string,
  init: ApiFetchOptions,
  schema: TSchema
): Promise<ApiResult<TSchema, true>>;

export async function apiFetch(path: string, init?: ApiFetchOptions): Promise<ApiResult>;

export async function apiFetch<TSchema extends z.ZodTypeAny>(
  path: string,
  init?: ApiFetchOptions,
  schema?: TSchema
): Promise<ApiResult<TSchema, true> | ApiResult> {
  const isServer = typeof window === 'undefined';

  const fetchOptions: RequestInit = {
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
    fetchOptions.headers = {
      ...fetchOptions.headers,
      ...init?.headers
    };
  }

  try {
    const response = await fetch(getApiBase() + path, fetchOptions);

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        try {
          errorData = await response.text();
        } catch {
          errorData = response.statusText;
        }
      }

      return {
        ok: false,
        response,
        status: response.status,
        statusText: response.statusText,
        error: errorData
      };
    }

    // Handle binary response if specified
    if (init?.responseType === 'binary') {
      const blob = await response.blob();
      return { ok: true, response, data: blob };
    }

    try {
      const text = await response.text();
      const isEmpty = !text || text.trim().length === 0;
      const json = isEmpty ? null : JSON.parse(text);

      if (schema) {
        const parsedData = schema.parse(json);
        return { ok: true, response, data: parsedData };
      } else {
        return { ok: true, response, data: json };
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Response validation failed: ${error.message}`);
      }
      throw new ApiFetchError(`Failed to parse JSON response: ${error}`, response, undefined);
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'ApiFetchError') {
      throw new ApiFetchError(
        `Network error: ${error.message}`,
        new Response(null, { status: 500, statusText: 'Network Error' })
      );
    }
    throw error;
  }
}
