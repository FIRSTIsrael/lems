'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { HttpLink, ApolloLink } from '@apollo/client';
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache
} from '@apollo/client-integration-nextjs';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { OperationTypeNode } from 'graphql';
import { getApiBase } from '@lems/shared';

export type ConnectionState = 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'idle';

interface ConnectionStateContextType {
  state: ConnectionState;
  lastError: Error | null;
}

const ConnectionStateContext = createContext<ConnectionStateContextType | undefined>(undefined);

/**
 * Creates an Apollo Client instance for client-side use
 * Integrates with the connection state context to track WebSocket status
 */
function makeClient(
  setState: (state: ConnectionState) => void,
  setError: (error: Error | null) => void
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
      url: `${apiBase.replace(/^https?/, 'ws')}/lems/graphql`,
      retryAttempts: Infinity, // Retry indefinitely
      shouldRetry: () => true, // Retry on all connection failures
      on: {
        connected: () => {
          setState('connected');
          setError(null);
        },
        connecting: () => {
          setState('reconnecting');
        },
        error: (error: unknown) => {
          setState('error');
          setError(error instanceof Error ? error : new Error(String(error)));
          console.warn('[GraphQL WS] Connection error:', error);
        },
        closed: () => {
          setState('disconnected');
          console.warn('[GraphQL WS] Connection closed');
        }
      }
    })
  );

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
    cache: new InMemoryCache({
      typePolicies: {
        Event: { keyFields: ['id'] },
        Division: { keyFields: ['id'] },
        Team: { keyFields: ['id'] },
        Volunteer: {
          // Use id when available, otherwise don't normalize
          keyFields: object => (object.id ? ['id'] : false)
        },
        Table: { keyFields: ['id'] },
        Room: { keyFields: ['id'] },
        Rubric: { keyFields: ['id'] },
        Judging: {
          // Judging doesn't have an id field, so don't normalize it
          keyFields: false,
          // Custom merge function to safely merge Judging objects fetched with different arguments
          merge(existing = {}, incoming) {
            // Merge the objects, allowing multiple field queries to coexist
            // e.g., { sessions: [...], rubrics: [...] }
            return { ...existing, ...incoming };
          }
        },
        Field: {
          // Field doesn't have an id field, so don't normalize it
          keyFields: false,
          // Custom merge function to safely merge Field objects fetched with different arguments
          merge(existing = {}, incoming) {
            // Merge the objects, allowing multiple field queries to coexist
            // e.g., { matches: [...], matchLength: ..., currentStage: ... }
            return { ...existing, ...incoming };
          }
        },
        MatchParticipant: {
          // MatchParticipant doesn't have an id field
          // Don't normalize it to avoid cache issues
          keyFields: false
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all'
      },
      query: {
        fetchPolicy: 'cache-and-network',
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

  const value: ConnectionStateContextType = useMemo(
    () => ({
      state,
      lastError
    }),
    [state, lastError]
  );

  const makeClientWithState = useMemo(() => () => makeClient(setState, setLastError), []);

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
