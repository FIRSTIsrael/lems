import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { OperationVariables, TypedDocumentNode } from '@apollo/client';
import { useConnectionState } from '../../../../../lib/graphql/apollo-client-provider';

/**
 * Default interval (in milliseconds) for periodic background data validation.
 */
const DEFAULT_REFETCH_INTERVAL_MS = 60_000; // 60 seconds

/**
 * Minimum time (in milliseconds) a tab must be hidden before triggering a refetch on visibility change.
 */
const VISIBILITY_REFETCH_THRESHOLD_MS = 10_000; // 10 seconds

/**
 * Configuration for a single subscription event using subscribeToMore
 */
export interface SubscriptionConfig<
  TSubscriptionData = unknown,
  TResult = unknown,
  TSubscriptionVars extends OperationVariables = OperationVariables
> {
  /** GraphQL subscription document */
  subscription: TypedDocumentNode<TSubscriptionData, TSubscriptionVars>;

  /** Variables to pass to the subscription */
  subscriptionVariables?: TSubscriptionVars;

  /**
   * Function to reconcile subscription updates with query result.
   * Receives the previous query result and the subscription response,
   * and must return the updated query result.
   */
  updateQuery: (prev: TResult, subscriptionData: { data?: TSubscriptionData }) => TResult;
}

export interface UsePageDataResult<TData> {
  data: TData | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
}

export interface UsePageDataOptions {
  /**
   * Interval (in milliseconds) for periodic background refetches.
   * Set to 0 to disable periodic refetches.
   * @default 60000 (60 seconds)
   */
  refetchIntervalMs?: number;
}

/**
 * Generic hook for managing page data with support for multiple subscriptions.
 * IMPORTANT: The subscriptions array must remain constant between renders.
 * Do not create a new array on each render - pass a memoized or static reference.
 *
 * @param graphqlQuery - The initial GraphQL query to fetch all page data
 * @param variables - Variables for the initial query
 * @param dataParser - Optional function to transform query data into page data
 * @param subscriptions - Optional array of subscription configurations for real-time updates (must be stable)
 * @param options - Optional configuration for refetch behavior
 * @returns Page data, loading state, error, and refetch function
 */
export function usePageData<
  TResult,
  TVariables,
  TData = TResult,
  TSubVars extends OperationVariables = OperationVariables
>(
  graphqlQuery: TypedDocumentNode<TResult, TVariables>,
  variables?: OperationVariables,
  dataParser?: (data: TResult) => TData,
  subscriptions?: SubscriptionConfig<unknown, TResult, TSubVars>[],
  options?: UsePageDataOptions
): UsePageDataResult<TData> {
  const [data, setData] = useState<TData | undefined>(undefined);
  const { state: connectionState } = useConnectionState();
  const initialized = useRef(false);
  const subscriptionCountRef = useRef<number | undefined>(subscriptions?.length);
  const hiddenSinceRef = useRef<number | null>(null);
  const previousVariablesRef = useRef<OperationVariables | undefined>(variables);
  const unsubscribersRef = useRef<Array<() => void>>([]);

  const refetchIntervalMs = options?.refetchIntervalMs ?? DEFAULT_REFETCH_INTERVAL_MS;

  if (subscriptions?.length !== subscriptionCountRef.current) {
    throw new Error(
      `[usePageData] Subscription count changed from ${subscriptionCountRef.current} to ${subscriptions?.length}. ` +
        'The subscriptions array must remain stable between renders. Use useMemo() to memoize the array.'
    );
  }

  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
    refetch: refetchData,
    subscribeToMore
  } = useQuery(graphqlQuery, {
    variables,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true // Track loading states accurately
  });

  // Detect if key variables (like divisionId) have changed and clean up old subscriptions
  useEffect(() => {
    const variablesChanged =
      JSON.stringify(previousVariablesRef.current) !== JSON.stringify(variables);

    if (variablesChanged && previousVariablesRef.current !== undefined) {
      console.log('[usePageData] Key variables changed, cleaning up old subscriptions', {
        previous: previousVariablesRef.current,
        current: variables
      });

      // Unsubscribe from all existing subscriptions
      unsubscribersRef.current.forEach(unsub => {
        try {
          unsub();
        } catch (err) {
          console.error('[usePageData] Error unsubscribing:', err);
        }
      });
      unsubscribersRef.current = [];

      // Clear data to prevent stale data from previous context
      setData(undefined);
    }

    previousVariablesRef.current = variables;
  }, [variables]);

  // Initialize data when query data arrives
  useEffect(() => {
    if (!queryData) return;

    let parsedData: TData;
    if (dataParser) {
      parsedData = dataParser(queryData);
    } else {
      parsedData = queryData as unknown as TData;
    }

    setData(parsedData);
  }, [dataParser, queryData]);

  // Refetch on reconnection after disconnection
  useEffect(() => {
    if (connectionState === 'connected' && initialized.current) {
      console.log('[usePageData] Connection restored - triggering refetch');
      refetchData().catch(err =>
        console.error('[usePageData] Failed to refetch after reconnection:', err)
      );
    }

    if (connectionState === 'connected') {
      initialized.current = true;
    }
  }, [connectionState, refetchData]);

  // Periodic background refetch for data validation
  useEffect(() => {
    if (refetchIntervalMs <= 0) {
      return; // Periodic refetch disabled
    }

    console.log(`[usePageData] Setting up periodic refetch every ${refetchIntervalMs}ms`);

    const intervalId = setInterval(() => {
      console.log('[usePageData] Periodic refetch triggered');
      refetchData().catch(err =>
        console.error('[usePageData] Failed to refetch during periodic validation:', err)
      );
    }, refetchIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [refetchData, refetchIntervalMs]);

  // Refetch when tab becomes visible after being hidden for 10+ seconds
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (hiddenSinceRef.current !== null) {
          const hiddenDuration = now - hiddenSinceRef.current;
          if (hiddenDuration >= VISIBILITY_REFETCH_THRESHOLD_MS) {
            console.log(
              `[usePageData] Tab became visible after ${hiddenDuration}ms hidden - triggering refetch`
            );
            refetchData().catch(err =>
              console.error('[usePageData] Failed to refetch after visibility change:', err)
            );
          }
          hiddenSinceRef.current = null;
        }
      } else {
        // Tab became hidden
        if (hiddenSinceRef.current === null) {
          hiddenSinceRef.current = Date.now();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchData]);

  // Set up subscriptions using subscribeToMore
  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0 || !queryData) {
      return;
    }

    // Clean up previous subscriptions before setting up new ones
    unsubscribersRef.current.forEach(unsub => {
      try {
        unsub();
      } catch (err) {
        console.error('[usePageData] Error unsubscribing:', err);
      }
    });
    unsubscribersRef.current = [];

    subscriptions.forEach((config, index) => {
      console.debug('[usePageData] Setting up subscription', index);

      const unsubscribe = subscribeToMore({
        document: config.subscription,
        variables: config.subscriptionVariables,
        updateQuery: (
          prev: TResult,
          { subscriptionData }: { subscriptionData: { data?: unknown } }
        ) => {
          if (!subscriptionData.data) {
            return prev;
          }

          // Call the user's updateQuery function
          const updated = config.updateQuery(prev, subscriptionData as { data?: unknown });

          return updated || prev;
        }
      } as Parameters<typeof subscribeToMore>[0]);

      unsubscribersRef.current.push(unsubscribe);
    });

    return () => {
      unsubscribersRef.current.forEach(unsub => {
        try {
          unsub();
        } catch (err) {
          console.error('[usePageData] Error unsubscribing on cleanup:', err);
        }
      });
      unsubscribersRef.current = [];
    };

    // queryData does not need to by in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions, subscribeToMore, !!queryData]);

  return {
    data,
    loading: queryLoading && data === undefined,
    error: queryError,
    refetch: refetchData
  };
}
