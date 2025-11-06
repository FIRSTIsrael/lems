import { HttpLink } from '@apollo/client';
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache
} from '@apollo/client-integration-nextjs';
import { getApiBase } from '@lems/shared';

/**
 * Creates and registers an Apollo Client instance for server-side use
 * This client is shared across requests in React Server Components
 */
export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
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
    link: new HttpLink({
      uri: `${getApiBase()}/lems/graphql`,
      credentials: 'include',
      fetch,
      fetchOptions: {
        // Pass Next.js-specific fetch options here if needed
        // e.g., { cache: 'no-store', revalidate: 0 }
      }
    })
  });
});
