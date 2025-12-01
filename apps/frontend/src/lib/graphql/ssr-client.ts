import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors';
import { RetryLink } from '@apollo/client/link/retry';
import { registerApolloClient } from '@apollo/client-integration-nextjs';
import { getApiBase } from '@lems/shared';

/**
 * Creates and registers an Apollo Client instance for server-side use
 * This client is shared across requests in React Server Components
 */
export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const httpLink = new HttpLink({
    uri: `${getApiBase()}/lems/graphql`,
    credentials: 'include',
    fetch,
    fetchOptions: {
      // Pass Next.js-specific fetch options here if needed
      // e.g., { cache: 'no-store', revalidate: 0 }
    }
  });

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

  const link = ApolloLink.from([errorLink, retryLink, httpLink]);

  return new ApolloClient({
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
        Room: { keyFields: ['id'] },
        Judging: {
          // Judging doesn't have an id field, so don't normalize it
          keyFields: false,
          // Custom merge function to safely merge Judging objects fetched with different arguments
          merge(existing = {}, incoming) {
            // Merge the objects, allowing multiple field queries to coexist
            // e.g., { sessions: [...], rubrics: [...] }
            return { ...existing, ...incoming };
          }
        }
      }
    }),
    link,
    defaultOptions: {
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      },
      mutate: {
        errorPolicy: 'all'
      }
    }
  });
});
