'use client';

import { HttpLink } from '@apollo/client';
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache
} from '@apollo/client-integration-nextjs';
import { getApiBase } from '@lems/shared';

/**
 * Creates an Apollo Client instance for client-side use
 * This is called for each client component tree to create a new client
 */
function makeClient() {
  const httpLink = new HttpLink({
    uri: `${getApiBase()}/lems/graphql`,
    credentials: 'include',
    fetch,
    fetchOptions: {
      // Pass Next.js-specific fetch options here if needed
      // e.g., { cache: 'no-store' }
    }
  });

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
        Room: { keyFields: ['id'] }
      }
    }),
    link: httpLink,
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

interface ApolloWrapperProps {
  children: React.ReactNode;
}

/**
 * Apollo Client provider wrapper for client components
 * Uses ApolloNextAppProvider to properly support Next.js App Router
 * and ensure all client components share the same Apollo Client instance
 */
export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
