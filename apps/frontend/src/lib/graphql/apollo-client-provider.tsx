'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useRef
} from 'react';
import { HttpLink, ApolloLink } from '@apollo/client';
import { ApolloClient, ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient, Client as WsClient } from 'graphql-ws';
import { OperationTypeNode } from 'graphql';
import { getApiBase } from '@lems/shared';
import { createApolloCache } from './cache-config';

export type ConnectionState = 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'idle';

interface ConnectionStateContextType {
  state: ConnectionState;
  lastError: Error | null;
  resetConnection: () => void;
}

const ConnectionStateContext = createContext<ConnectionStateContextType | undefined>(undefined);

/**
 * Creates an Apollo Client instance for client-side use
 * Integrates with the connection state context to track WebSocket status
 */
function makeClient(
  setConnectionState: (state: ConnectionState) => void,
  setError: (error: Error | null) => void,
  wsClientRef: { current: WsClient | null },
  isResettingRef: { current: boolean }
) {
  const apiBase = getApiBase() || 'http://localhost:3333';

  // HTTP link for queries and mutations
  const httpLink = new HttpLink({
    uri: `${apiBase}/lems/graphql`,
    credentials: 'include',
    fetch,
    fetchOptions: {
      // Pass Next.js-specific fetch options here if needed
      // e.g., { cache: 'no-store' }
    }
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: `${apiBase.replace(/^http/, 'ws')}/lems/graphql`,
      retryAttempts: Infinity, // Retry indefinitely
      shouldRetry: () => true, // Retry on all connection failures
      keepAlive: 2_500, // Send ping every 2.5 seconds
      on: {
        connected: () => {
          console.log('[GraphQL WS] Connected');
          setConnectionState('connected');
          setError(null);
        },
        connecting: () => {
          console.log('[GraphQL WS] Connecting...');
          setConnectionState('reconnecting');
        },
        error: (error: unknown) => {
          console.log('[GraphQL WS] Connection error:', error);
          setConnectionState('error');
          setError(error instanceof Error ? error : new Error(String(error)));
        },
        closed: () => {
          // Only set to 'disconnected' if we're not intentionally resetting
          if (!isResettingRef.current) {
            console.log('[GraphQL WS] Connection closed');
            setConnectionState('disconnected');
          } else {
            console.log('[GraphQL WS] Connection reset');
          }
        }
      }
    })
  );

  // Store the WS client for later disposal
  // GraphQLWsLink exposes the underlying client but it's not in the public type
  const linkWithClient = wsLink as GraphQLWsLink & { client?: WsClient };
  if (linkWithClient.client) {
    wsClientRef.current = linkWithClient.client;
  }

  const errorLink = new ErrorLink(({ error, operation }) => {
    if (CombinedGraphQLErrors.is(error)) {
      error.errors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
        )
      );
    } else if (CombinedProtocolErrors.is(error)) {
      error.errors.forEach(({ message, extensions }) =>
        console.log(
          `[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`
        )
      );
    } else {
      console.error(`[Network error]: ${error}, Operation: ${operation}`);
    }
  });

  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: 10000,
      jitter: true // Add randomness to prevent thundering herd
    },
    attempts: {
      max: 5,
      retryIf: error => {
        // Don't retry on client errors (4xx)
        if (
          'statusCode' in error &&
          typeof error.statusCode === 'number' &&
          error.statusCode < 500
        ) {
          return false;
        }

        return true;
      }
    }
  });

  // Split traffic: subscriptions use WebSocket, queries and mutations use HTTP
  const splitLink = ApolloLink.split(
    ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
    wsLink,
    ApolloLink.from([errorLink, retryLink, httpLink])
  );

  return new ApolloClient({
    link: splitLink,
    cache: createApolloCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all'
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
      },
      mutate: {
        errorPolicy: 'all'
      }
    }
  });
}

export function ApolloClientProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionState>('idle');
  const [lastError, setLastError] = useState<Error | null>(null);

  const wsClientRef = useRef<WsClient | null>(null);
  const clientRef = useRef<ApolloClient | null>(null);
  const isResettingRef = useRef(false);

  // Use callbacks to capture current setState functions
  // These are called by WebSocket events and always get the latest setState
  const setConnectionState = useCallback((newState: ConnectionState) => {
    console.log('[Apollo] Setting connection state to:', newState);
    setState(newState);
  }, []);

  const setError = useCallback((error: Error | null) => {
    setLastError(error);
  }, []);

  // Create a stable makeClient function that uses the callbacks
  // This function is called once by ApolloNextAppProvider
  const makeClientWithState = useCallback(() => {
    console.log('[Apollo] makeClientWithState called');

    // If client already exists, return it (ApolloNextAppProvider caches it)
    if (clientRef.current) {
      console.log('[Apollo] Client already exists, returning cached instance');
      return clientRef.current;
    }

    console.log('[Apollo] Creating new Apollo Client');

    // Dispose old WebSocket if it exists
    if (wsClientRef.current) {
      console.log('[Apollo] Disposing old WebSocket');
      wsClientRef.current.dispose();
      wsClientRef.current = null;
    }

    // Create new client with stable callback functions
    const client = makeClient(setConnectionState, setError, wsClientRef, isResettingRef);
    clientRef.current = client;
    return client;
  }, [setConnectionState, setError]);

  // Stable reset function
  const resetConnection = useCallback(() => {
    if (isResettingRef.current) {
      console.log('[Apollo] Reset already in progress, skipping duplicate');
      return;
    }

    isResettingRef.current = true;
    console.log('[Apollo] Resetting WebSocket connection');

    if (wsClientRef.current) {
      wsClientRef.current.terminate();
      console.log('[Apollo] WebSocket terminated');
    }

    setConnectionState('idle');
    isResettingRef.current = false;
    setError(null);

    if (clientRef.current) {
      clientRef.current.cache.gc();
    }
  }, [setConnectionState, setError]);

  const value: ConnectionStateContextType = useMemo(
    () => ({
      state,
      lastError,
      resetConnection
    }),
    [state, lastError, resetConnection]
  );

  return (
    <ApolloNextAppProvider makeClient={makeClientWithState}>
      <ConnectionStateContext.Provider value={value}>{children}</ConnectionStateContext.Provider>
    </ApolloNextAppProvider>
  );
}

export function useConnectionState(): ConnectionStateContextType {
  const context = useContext(ConnectionStateContext);

  if (context === undefined) {
    throw new Error('useConnectionState must be used within a ConnectionStateProvider');
  }

  return context;
}
