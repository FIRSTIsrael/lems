import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { OperationTypeNode } from 'graphql';
import { getApiBase } from '@lems/shared';

/**
 * Creates a configured Apollo Client instance for the LEMS frontend.
 *
 * Features:
 * - HTTP link for queries and mutations
 * - WebSocket link for subscriptions (graphql-ws)
 * - Error handling and logging
 * - Automatic retry logic with exponential backoff
 * - Normalized cache with type policies for all LEMS entity types
 * - TypeScript-friendly error handling
 *
 * @returns Configured Apollo Client instance
 */
export function createApolloClient() {
  const apiBase = getApiBase() || 'http://localhost:3333';

  // HTTP link for queries and mutations
  const httpLink = new HttpLink({
    uri: `${apiBase}/lems/graphql`,
    credentials: 'include', // Send cookies with requests
    fetch
  });

  // WebSocket link for subscriptions
  const wsLink = new GraphQLWsLink(
    createClient({
      url: `${apiBase.replace(/^https?/, 'ws')}/lems/graphql`,
      retryAttempts: Infinity, // Retry indefinitely
      shouldRetry: () => true // Retry on all connection failures
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

  const link = splitLink;

  // Create Apollo Client with normalized cache
  return new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        Event: { keyFields: ['id'] },
        Division: { keyFields: ['id'] },
        Team: { keyFields: ['id'] },
        RootTeam: { keyFields: ['id'] },
        Volunteer: {
          // Use id when available, otherwise don't normalize
          keyFields: object => (object.id ? ['id'] : false)
        },
        Table: { keyFields: ['id'] },
        Room: { keyFields: ['id'] }
      }
    }),

    // Default options for queries and mutations
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all'
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      },
      mutate: {
        errorPolicy: 'all'
      }
    }
  });
}
