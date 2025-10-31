import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

/**
 * Creates a configured Apollo Client instance for the LEMS frontend.
 *
 * Features:
 * - HTTP link pointing to the LEMS GraphQL endpoint
 * - Error handling and logging
 * - Automatic retry logic with exponential backoff
 * - Normalized cache with type policies
 *
 * @returns Configured Apollo Client instance
 */
export function createApolloClient() {
  // HTTP link for queries and mutations
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
    credentials: 'include', // Send cookies with requests
    fetch
  });

  // Error handling and logging
  const errorLink = new ErrorLink(({ error, operation }) => {
    if (error) {
      console.error(`[GraphQL error]: Operation "${operation.operationName}" - ${error.message}`, {
        error
      });

      // Handle specific error types
      if ('statusCode' in error && typeof error.statusCode === 'number') {
        switch (error.statusCode) {
          case 401:
            console.error('Authentication required. Please log in.');
            break;
          case 403:
            console.error('Access forbidden. Insufficient permissions.');
            break;
          case 500:
            console.error('Server error. Please try again later.');
            break;
        }
      }
    }
  });

  // Retry logic with exponential backoff
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

  const link = ApolloLink.from([errorLink, retryLink, httpLink]);

  // Create Apollo Client with normalized cache
  return new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        Event: { keyFields: ['id'] },
        Division: { keyFields: ['id'] },
        Team: { keyFields: ['id'] },
        RootTeam: { keyFields: ['id'] },
        Volunteer: { keyFields: ['id'] },
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
