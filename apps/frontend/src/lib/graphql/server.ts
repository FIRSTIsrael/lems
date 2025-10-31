import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';

/**
 * Server-side Apollo Client for fetching data in Next.js App Router
 * server components and route handlers.
 *
 * This is separate from the client-side Apollo Client used in browser components.
 * It's used for server-side rendering and async data fetching.
 */
let serverApolloClient: ApolloClient | null = null;

function getServerApolloClient() {
  if (!serverApolloClient) {
    const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

    serverApolloClient = new ApolloClient({
      link: new HttpLink({
        uri: endpoint,
        credentials: 'include',
        fetch
      }),
      cache: new InMemoryCache()
    });
  }

  return serverApolloClient;
}

/**
 * Extracts GraphQL error messages from an error object
 * @param error - The caught error
 * @returns Array of error messages or null if not a GraphQL error
 */
function extractGraphQLErrors(error: unknown): Array<{ message: string }> | null {
  if (error instanceof Error && 'graphQLErrors' in error) {
    const gqlErrors = (error as { graphQLErrors?: Array<{ message: string }> }).graphQLErrors;
    if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
      return gqlErrors;
    }
  }
  return null;
}

/**
 * Execute a GraphQL query on the server side
 *
 * @param query - GraphQL query document
 * @param variables - Query variables
 * @returns Promise with the query result
 *
 * @example
 * const result = await serverGraphQLQuery(GET_EVENT_QUERY, { id: 'abc123' });
 * if (result.errors) throw new Error('Query failed');
 * return result.data;
 */
export async function serverGraphQLQuery<TData = Record<string, unknown>>(
  query: ReturnType<typeof gql>,
  variables?: Record<string, unknown>
): Promise<{ data: TData | null; errors?: Array<{ message: string }> }> {
  const client = getServerApolloClient();

  try {
    const result = await client.query<TData>({
      query,
      variables,
      fetchPolicy: 'no-cache' // Always fetch fresh data on server
    });

    return { data: result.data ?? null };
  } catch (error: unknown) {
    const graphQLErrors = extractGraphQLErrors(error);
    if (graphQLErrors) {
      return { data: null, errors: graphQLErrors };
    }
    throw error;
  }
}

/**
 * Execute a GraphQL mutation on the server side
 *
 * @param mutation - GraphQL mutation document
 * @param variables - Mutation variables
 * @returns Promise with the mutation result
 */
export async function serverGraphQLMutation<TData = Record<string, unknown>>(
  mutation: ReturnType<typeof gql>,
  variables?: Record<string, unknown>
): Promise<{ data: TData | null; errors?: Array<{ message: string }> }> {
  const client = getServerApolloClient();

  try {
    const result = await client.mutate<TData>({
      mutation,
      variables,
      fetchPolicy: 'no-cache'
    });

    return { data: result.data ?? null };
  } catch (error: unknown) {
    const graphQLErrors = extractGraphQLErrors(error);
    if (graphQLErrors) {
      return { data: null, errors: graphQLErrors };
    }
    throw error;
  }
}
