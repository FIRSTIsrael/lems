import { ApolloClient, HttpLink, ApolloLink } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client/errors';
import { RetryLink } from '@apollo/client/link/retry';
import { registerApolloClient } from '@apollo/client-integration-nextjs';
import { getApiBase } from '@lems/shared';
import { createApolloCache } from './cache-config';

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
    cache: createApolloCache(),
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
