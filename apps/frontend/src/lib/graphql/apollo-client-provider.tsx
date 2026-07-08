'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
  useEffect
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
 * Module-level mutable references for WebSocket connection state callbacks.
 *
 * WHY this is needed:
 * `@apollo/client-react-streaming` (used by ApolloNextAppProvider) stores the
 * Apollo Client as a window-level singleton via `window[Symbol.for('ApolloClientSingleton')]`.
 * This means `makeClient()` is only called ONCE per browser session (never re-called on
 * component remount). The graphql-ws event handlers created in that first call capture
 * the `setState` from the first component instance. If `ApolloClientProvider` ever remounts
 * (e.g., on locale change or error-boundary recovery), the new component's `useState` starts
 * at 'idle', but the event handlers still call the old (orphaned) `setState` — the new
 * component's state is never updated, leaving the indicator stuck at 'idle' forever.
 *
 * By forwarding through these module-level refs, the event handlers always dispatch to
 * whichever component instance is currently mounted, regardless of how many times the
 * component has remounted.
 *
 * JavaScript is single-threaded so there are no concurrent-access race conditions.
 * React 18 concurrent mode does not run effects or event callbacks concurrently — they
 * are always serialised on the event loop.
 */
let wsConnectionStateCallback: (state: ConnectionState) => void = () => {};
let wsErrorCallback: (error: Error | null) => void = () => {};

// Track the last known state so a remounting component can immediately sync
// via the useState lazy initializer.  Note: these are updated BEFORE the callback
// is invoked, so events that fire in the brief gap between unmount and remount
// (when the callbacks are no-ops) still advance lastKnownConnectionState, and
// the next mount picks up the correct value at initialization time.
let lastKnownConnectionState: ConnectionState = 'idle';
let lastKnownError: Error | null = null;

// Store the graphql-ws client at module level so that resetConnection() works
// correctly even after a remount (when the per-instance wsClientRef is null).
let globalWsClient: WsClient | null = null;

// Tracks whether a connection reset is in progress (replaces the React ref so
// it persists correctly across remounts alongside the singleton WS client).
const wsIsResettingRef: { current: boolean } = { current: false };

/**
 * Creates an Apollo Client instance for client-side use.
 * Integrates with the connection state context to track WebSocket status.
 */
function makeClient(wsClientRef: { current: WsClient | null }) {
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
          lastKnownConnectionState = 'connected';
          lastKnownError = null;
          wsConnectionStateCallback('connected');
          wsErrorCallback(null);
        },
        connecting: () => {
          console.log('[GraphQL WS] Connecting...');
          lastKnownConnectionState = 'reconnecting';
          wsConnectionStateCallback('reconnecting');
        },
        error: (error: unknown) => {
          console.log('[GraphQL WS] Connection error:', error);
          const err = error instanceof Error ? error : new Error(String(error));
          lastKnownConnectionState = 'error';
          lastKnownError = err;
          wsConnectionStateCallback('error');
          wsErrorCallback(err);
        },
        closed: () => {
          // Only set to 'disconnected' if we're not intentionally resetting
          if (!wsIsResettingRef.current) {
            console.log('[GraphQL WS] Connection closed');
            lastKnownConnectionState = 'disconnected';
            wsConnectionStateCallback('disconnected');
          } else {
            console.log('[GraphQL WS] Connection reset');
          }
        }
      }
    })
  );

  // Store the WS client for later use (e.g. terminate() in resetConnection).
  // GraphQLWsLink.client is a public readonly property.
  // Also store at module level so resetConnection() can reach it after remounts.
  wsClientRef.current = wsLink.client;
  globalWsClient = wsLink.client;

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
  // Initialise from last known state so that a remounting component immediately
  // reflects the correct indicator value without waiting for the next WS event.
  const [state, setState] = useState<ConnectionState>(() => lastKnownConnectionState);
  const [lastError, setLastError] = useState<Error | null>(() => lastKnownError);

  const wsClientRef = useRef<WsClient | null>(null);
  const clientRef = useRef<ApolloClient | null>(null);

  // Create a stable makeClient function.
  // NOTE: ApolloNextAppProvider only calls this on first ever mount (it caches
  // the result in window[Symbol.for('ApolloClientSingleton')]). On subsequent
  // remounts of ApolloClientProvider the window singleton is reused, so this
  // function is NOT called again. Connection state is handled via the module-level
  // callback refs above instead.
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

    const client = makeClient(wsClientRef);
    clientRef.current = client;
    return client;
  }, []);

  // On every mount (including remounts) wire up the module-level callbacks to
  // the current component's setState functions.  This is the key fix: because
  // makeClient() is only called once (window singleton), the graphql-ws event
  // handlers permanently forward through these module-level refs — re-pointing
  // them here ensures the currently mounted component always receives state updates.
  useEffect(() => {
    wsConnectionStateCallback = (newState: ConnectionState) => {
      console.log('[Apollo] Setting connection state to:', newState);
      setState(newState);
    };
    wsErrorCallback = (error: Error | null) => {
      setLastError(error);
    };

    return () => {
      // On unmount reset to no-ops so events fired before the next mount
      // don't attempt to call setState on an unmounted component.
      wsConnectionStateCallback = () => {};
      wsErrorCallback = () => {};
    };
  }, []); // Run once per mount / once per remount

  const resetConnection = useCallback(() => {
    if (wsIsResettingRef.current) {
      console.log('[Apollo] Reset already in progress, skipping duplicate');
      return;
    }

    wsIsResettingRef.current = true;
    console.log('[Apollo] Resetting WebSocket connection');

    // Use the per-instance ref when available (first mount); fall back to the
    // module-level client for remount scenarios where makeClientWithState was
    // not re-invoked (Apollo window singleton reused).
    const wsClient = wsClientRef.current ?? globalWsClient;
    if (wsClient) {
      wsClient.terminate();
      console.log('[Apollo] WebSocket terminated');
    }

    lastKnownConnectionState = 'idle';
    lastKnownError = null;
    setState('idle');
    wsIsResettingRef.current = false;
    setLastError(null);

    if (clientRef.current) {
      clientRef.current.cache.gc();
    }
  }, []);

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
