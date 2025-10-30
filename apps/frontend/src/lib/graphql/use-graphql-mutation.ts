'use client';

/**
 * useGraphQLMutation Hook
 * Production-ready hook for GraphQL mutations over HTTP
 * Mutations are one-time operations and should use HTTP, not WebSocket subscriptions
 */

import { useState, useCallback } from 'react';
import { apiFetch } from '@lems/shared';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface GraphQLMutationConfig<TData, TVariables extends Record<string, unknown>> {
  mutation: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export interface GraphQLMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Hook for executing GraphQL mutations over HTTP
 */
export function useGraphQLMutation<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>
>(config: GraphQLMutationConfig<TData, TVariables>): GraphQLMutationResult<TData, TVariables> {
  const { mutation, onSuccess, onError } = config;

  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFetch('/lems/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: mutation,
            variables
          })
        });

        if (!result.ok) {
          throw new Error(`GraphQL mutation failed: ${result.status} ${result.statusText}`);
        }

        const graphqlResponse = result.data as {
          data?: TData;
          errors?: Array<{ message: string }>;
        };

        if (graphqlResponse.errors && graphqlResponse.errors.length > 0) {
          throw new Error(graphqlResponse.errors[0]?.message || 'GraphQL mutation error');
        }

        if (!graphqlResponse.data) {
          throw new Error('GraphQL mutation response contained no data');
        }

        const responseData = graphqlResponse.data;
        setData(responseData);
        setIsLoading(false);
        onSuccess?.(responseData);
        return responseData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Mutation failed');
        setError(error);
        setIsLoading(false);
        onError?.(error);
        throw error;
      }
    },
    [mutation, onSuccess, onError]
  );

  return {
    mutate,
    data,
    error,
    isLoading
  };
}
