import { z } from 'zod';
import { apiFetch } from './fetch';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

/**
 * Makes a type-safe GraphQL request to the LEMS GraphQL endpoint with Zod schema validation
 *
 * @param query - The GraphQL query string
 * @param schema - Zod schema for the data field in the response
 * @param variables - Optional variables for the query
 *
 * @returns Promise with validated and typed GraphQL response data
 *
 * @example
 * const EventsSchema = z.object({
 *   events: z.array(z.object({
 *     id: z.string(),
 *     name: z.string(),
 *     slug: z.string()
 *   }))
 * });
 *
 * const query = `
 *   query GetEvents($fullySetUp: Boolean) {
 *     events(fullySetUp: $fullySetUp) {
 *       id
 *       name
 *       slug
 *     }
 *   }
 * `;
 *
 * const data = await graphqlFetch(query, EventsSchema, { fullySetUp: true });
 */
export async function graphqlFetch<TSchema extends z.ZodTypeAny>(
  query: string,
  schema: TSchema,
  variables?: Record<string, unknown>
): Promise<z.infer<TSchema>> {
  const result = await apiFetch('/lems/gql/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!result.ok) {
    throw new Error(`GraphQL request failed: ${result.status} ${result.statusText}`);
  }

  const graphqlResponse = result.data as GraphQLResponse<unknown>;

  if (graphqlResponse.errors && graphqlResponse.errors.length > 0) {
    throw new Error(`GraphQL errors: ${graphqlResponse.errors.map(e => e.message).join(', ')}`);
  }

  if (!graphqlResponse.data) {
    throw new Error('GraphQL response contained no data');
  }

  return schema.parse(graphqlResponse.data);
}
