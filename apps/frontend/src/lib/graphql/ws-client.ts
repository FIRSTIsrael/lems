/**
 * GraphQL WebSocket Client
 * Manages persistent WebSocket connections for GraphQL subscriptions
 */

import { createClient, Client, ClientOptions } from 'graphql-ws';

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export interface GraphQLWSClientConfig {
  url: string;
  connectionParams: () => Record<string, unknown> | Promise<Record<string, unknown>>;
  onStatusChange?: (status: ConnectionStatus) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Creates a GraphQL WebSocket client with automatic reconnection
 */
export function createGraphQLWSClient(config: GraphQLWSClientConfig): Client {
  const {
    url,
    connectionParams,
    onStatusChange,
    retryAttempts = Infinity,
    retryDelay = 1000
  } = config;

  let retryCount = 0;
  let disposed = false;

  const clientOptions: ClientOptions = {
    url,
    connectionParams,

    shouldRetry: () => {
      if (disposed) return false;
      if (retryAttempts === Infinity) return true;
      return retryCount < retryAttempts;
    },

    retryWait: async () => {
      retryCount++;
      onStatusChange?.('reconnecting');

      // Exponential backoff with jitter
      const delay = Math.min(retryDelay * Math.pow(2, retryCount - 1), 30000);
      const jitter = Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    },

    on: {
      connecting: () => {
        onStatusChange?.(retryCount === 0 ? 'connecting' : 'reconnecting');
      },

      connected: () => {
        retryCount = 0; // Reset retry count on successful connection
        onStatusChange?.('connected');
      },

      closed: (event: unknown) => {
        if (!disposed) {
          const closeEvent = event as CloseEvent | { code?: number };
          if (closeEvent.code === 1000 || closeEvent.code === 1001) {
            // Normal closure
            onStatusChange?.('disconnected');
          } else {
            // Abnormal closure - will retry
            onStatusChange?.('error');
          }
        }
      },

      error: error => {
        console.error('GraphQL WS Error:', error);
        onStatusChange?.('error');
      }
    },

    lazy: false, // Keep connection alive
    lazyCloseTimeout: 0, // Don't close on last unsubscribe
    keepAlive: 10_000 // Send ping every 10s
  };

  const client = createClient(clientOptions);

  // Extend with dispose method
  const originalDispose = client.dispose.bind(client);
  client.dispose = () => {
    disposed = true;
    originalDispose();
  };

  return client;
}
