/**
 * API Configuration utilities
 * Provides the correct API URLs for different environments
 */

import { getApiBase } from '@lems/shared';

/**
 * Get the WebSocket URL for GraphQL subscriptions
 * Uses the same base URL logic as apiFetch for consistency
 */
export function getGraphQLWsUrl(): string {
  const baseUrl = getApiBase(true); // Force client-side resolution

  if (!baseUrl) {
    // Fallback for local development
    return 'ws://localhost:3333/lems/graphql/ws';
  }

  // Convert HTTP(S) URL to WS(S)
  const wsUrl = baseUrl.replace(/^http/, 'ws');
  return `${wsUrl}/lems/graphql/ws`;
}
