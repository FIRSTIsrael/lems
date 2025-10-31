import { ApolloClient, HttpLink, InMemoryCache, gql, type TypedDocumentNode } from '@apollo/client';
import { getApiBase } from '@lems/shared';

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
    const endpoint = `${getApiBase()}/lems/graphql`;

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
 * For full type safety and inference, queries should be defined as TypedDocumentNode:
 *
 * @example
 * import { TypedDocumentNode } from '@apollo/client';
 *
 * type GetEventQuery = {
 *   event: {
 *     id: string;
 *     name: string;
 *   } | null;
 * };
 *
 * type GetEventQueryVariables = { id: string };
 *
 * const GET_EVENT: TypedDocumentNode<GetEventQuery, GetEventQueryVariables> = gql`
 *   query GetEvent($id: String!) {
 *     event(id: $id) {
 *       id
 *       name
 *     }
 *   }
 * `;
 *
 * // Type-safe execution with inference
 * const { data, errors } = await serverGraphQLQuery(GET_EVENT, { id: '123' });
 * // data type is GetEventQuery
 *
 * @param query - TypedDocumentNode or gql document
 * @param variables - Query variables
 * @returns Promise with the query result
 */
export async function serverGraphQLQuery<TData = Record<string, unknown>>(
  query: TypedDocumentNode<TData> | ReturnType<typeof gql>,
  variables?: Record<string, unknown>
): Promise<{ data: TData | null; errors?: Array<{ message: string }> }> {
  const client = getServerApolloClient();

  try {
    const result = await client.query<TData>({
      query: query as ReturnType<typeof gql>,
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
 * @param mutation - TypedDocumentNode or gql document
 * @param variables - Mutation variables
 * @returns Promise with the mutation result
 */
export async function serverGraphQLMutation<TData = Record<string, unknown>>(
  mutation: TypedDocumentNode<TData> | ReturnType<typeof gql>,
  variables?: Record<string, unknown>
): Promise<{ data: TData | null; errors?: Array<{ message: string }> }> {
  const client = getServerApolloClient();

  try {
    const result = await client.mutate<TData>({
      mutation: mutation as ReturnType<typeof gql>,
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
