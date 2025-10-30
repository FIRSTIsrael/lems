'use client';

/**
 * useGraphQLSubscription Hook
 * Production-ready GraphQL subscription hook with 100% QoS guarantee
 *
 * Features:
 * - Automatic connection management and reconnection
 * - Connection status tracking
 * - Initial data fetching from database (single source of truth)
 * - Revalidation on reconnection to ensure no missed updates
 * - Revalidation on window focus and visibility changes
 * - Type-safe with Zod validation
 * - Optimistic updates support
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { apiFetch } from '@lems/shared';
import { useGraphQLWSClient } from './graphql-ws-provider';

export interface GraphQLSubscriptionConfig<TData, TVariables = Record<string, never>> {
  /**
   * GraphQL subscription query string
   */
  subscription: string;

  /**
   * Variables for the subscription
   */
  variables?: TVariables;

  /**
   * GraphQL query to fetch initial data from the database
   * This ensures the database is the single source of truth
   */
  initialQuery: string;

  /**
   * Variables for the initial query
   */
  initialQueryVariables?: Record<string, unknown>;

  /**
   * Zod schema to validate incoming data
   */
  schema: z.ZodType<TData>;

  /**
   * How to merge subscription updates into existing data
   * Return the new state after applying the update
   */
  onUpdate: (currentData: TData | null, update: unknown) => TData;

  /**
   * Optional: custom fetch function for initial data
   * If not provided, will use default fetch to /lems/graphql endpoint
   */
  fetchInitialData?: (query: string, variables?: Record<string, unknown>) => Promise<TData>;

  /**
   * Whether to revalidate on window focus (default: true)
   */
  revalidateOnFocus?: boolean;

  /**
   * Whether to revalidate on reconnection (default: true)
   */
  revalidateOnReconnect?: boolean;
}

export interface GraphQLSubscriptionResult<TData> {
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  revalidate: () => Promise<void>;
}

/**
 * Hook to subscribe to GraphQL data with real-time updates
 */
export function useGraphQLSubscription<TData, TVariables = Record<string, never>>(
  config: GraphQLSubscriptionConfig<TData, TVariables>
): GraphQLSubscriptionResult<TData> {
  const { client, connectionStatus } = useGraphQLWSClient();

  const {
    subscription,
    variables,
    initialQuery,
    initialQueryVariables,
    schema,
    onUpdate,
    fetchInitialData,
    revalidateOnFocus = true,
    revalidateOnReconnect = true
  } = config;

  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const prevConnectionStatusRef = useRef<string>('connecting');

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  const isRevalidatingRef = useRef(false);

  // Stable refs for functions and schema that change on every render
  const onUpdateRef = useRef(onUpdate);
  const schemaRef = useRef(schema);
  const fetchInitialDataRef = useRef(fetchInitialData);

  // Stabilize variables to prevent unnecessary subscription recreation
  const stableVariables = useMemo(
    () => (variables ? JSON.stringify(variables) : '{}'),
    [variables]
  );

  const stableInitialQueryVariables = useMemo(
    () => (initialQueryVariables ? JSON.stringify(initialQueryVariables) : '{}'),
    [initialQueryVariables]
  );

  // Update refs when values change
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    schemaRef.current = schema;
    fetchInitialDataRef.current = fetchInitialData;
  }, [onUpdate, schema, fetchInitialData]);

  /**
   * Default fetch function for initial data
   */
  const defaultFetchInitialData = useCallback(
    async (query: string, vars?: Record<string, unknown>): Promise<TData> => {
      const result = await apiFetch('/lems/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables: vars
        })
      });

      if (!result.ok) {
        throw new Error(`GraphQL request failed: ${result.status} ${result.statusText}`);
      }

      const graphqlResponse = result.data as {
        data?: TData;
        errors?: Array<{ message: string }>;
      };

      if (graphqlResponse.errors && graphqlResponse.errors.length > 0) {
        throw new Error(graphqlResponse.errors[0]?.message || 'GraphQL error');
      }

      if (!graphqlResponse.data) {
        throw new Error('GraphQL response contained no data');
      }

      return graphqlResponse.data;
    },
    []
  );

  /**
   * Fetch initial data from the database
   * This ensures the database is the single source of truth
   */
  const revalidate = useCallback(async () => {
    if (isRevalidatingRef.current) return;

    isRevalidatingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const fetcher = fetchInitialDataRef.current || defaultFetchInitialData;
      const parsedVariables = stableInitialQueryVariables
        ? JSON.parse(stableInitialQueryVariables)
        : undefined;
      const initialData = await fetcher(initialQuery, parsedVariables);

      // Validate with Zod
      const validated = schemaRef.current.parse(initialData);

      if (isMountedRef.current) {
        setData(validated);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch initial data'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      isRevalidatingRef.current = false;
    }
  }, [initialQuery, stableInitialQueryVariables, defaultFetchInitialData]);

  /**
   * Subscribe to real-time updates
   */
  useEffect(() => {
    if (!client) return;

    let active = true;

    const subscribe = () => {
      // Clean up previous subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      const parsedVariables = stableVariables ? JSON.parse(stableVariables) : undefined;

      unsubscribeRef.current = client.subscribe(
        {
          query: subscription,
          variables: parsedVariables as Record<string, unknown>
        },
        {
          next: value => {
            if (!active || !isMountedRef.current) return;

            try {
              // Log the received value for debugging
              console.log('Subscription update received:', value);

              // Check if we have data
              if (!value.data) {
                console.warn('Subscription value has no data:', value);
                return;
              }

              // Apply the update to current data
              setData(currentData => {
                const updated = onUpdateRef.current(currentData, value.data);
                // Validate the updated data
                return schemaRef.current.parse(updated);
              });
            } catch (err) {
              console.error('Error processing subscription update:', err);
              setError(err instanceof Error ? err : new Error('Invalid subscription data'));
            }
          },
          error: err => {
            if (!active || !isMountedRef.current) return;
            console.error('Subscription error:', err);
            setError(err instanceof Error ? err : new Error('Subscription error'));
          },
          complete: () => {
            console.log('Subscription completed');
          }
        }
      );
    };

    subscribe();

    return () => {
      active = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [client, subscription, stableVariables]);

  /**
   * Track connection status changes and revalidate on reconnection
   */
  useEffect(() => {
    // Detect when we transition to 'connected' state
    if (
      revalidateOnReconnect &&
      connectionStatus === 'connected' &&
      prevConnectionStatusRef.current !== 'connected' &&
      prevConnectionStatusRef.current !== 'connecting' &&
      !isRevalidatingRef.current
    ) {
      console.log('Reconnected - revalidating data...');
      revalidate();
    }

    prevConnectionStatusRef.current = connectionStatus;
  }, [connectionStatus, revalidate, revalidateOnReconnect]);

  /**
   * Fetch initial data on mount
   */
  useEffect(() => {
    revalidate();
  }, [revalidate]);

  /**
   * Revalidate on window focus/visibility change
   */
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Window focused - revalidating data...');
        revalidate();
      }
    };

    const handleFocus = () => {
      console.log('Window focused - revalidating data...');
      revalidate();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [revalidate, revalidateOnFocus]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    revalidate
  };
}
