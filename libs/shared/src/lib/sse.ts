import { getApiBase } from './fetch';

export type SseEvent<T = unknown> =
  | { type: 'start' }
  | { type: 'progress'; percent: number; message?: string }
  | { type: 'success'; data?: T }
  | { type: 'failure'; message: string };

/**
 * Opens an SSE stream to the backend using a fetch-based approach.
 * Supports POST (and other methods), unlike native EventSource which only supports GET.
 * Automatically includes credentials and the CSRF bypass header.
 *
 * @param path - API path (e.g. '/admin/events/123/settings/download')
 * @param init - Optional fetch RequestInit options (method, headers, body, etc.)
 * @param handlers - Optional callbacks for `start` and `progress` events
 * @returns A Promise that resolves with the `success` event data, or rejects on `failure`
 */
export async function connectSseStream<T = unknown>(
  path: string,
  init?: RequestInit,
  handlers?: {
    onStart?: () => void;
    onProgress?: (percent: number, message?: string) => void;
  }
): Promise<T | undefined> {
  const headers = new Headers(init?.headers);
  headers.set('x-lems-csrf-enabled', 'true');

  const response = await fetch(getApiBase() + path, {
    ...init,
    credentials: 'include',
    headers
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE request failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data: ')) continue;

        const event: SseEvent<T> = JSON.parse(line.slice(6));

        switch (event.type) {
          case 'start':
            handlers?.onStart?.();
            break;
          case 'progress':
            handlers?.onProgress?.(event.percent, event.message);
            break;
          case 'success':
            return event.data as T;
          case 'failure':
            throw new Error(event.message);
        }
      }
    }

    return undefined;
  } finally {
    try {
      await reader.cancel();
    } catch {
      // Best-effort cleanup; preserve the original return value or error.
    }

    try {
      reader.releaseLock();
    } catch {
      // Best-effort cleanup; preserve the original return value or error.
    }
  }
}
