import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { OperationVariables, TypedDocumentNode } from '@apollo/client';

/**
 * Detects if a subscription data object contains a gap marker.
 * Gap markers indicate a potential data inconsistency that requires a refetch.
 *
 * @param data - The subscription data object
 * @returns true if a gap marker is detected, false otherwise
 */
const isGapMarker = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check for _gap property on any top-level value in the data object
  for (const value of Object.values(data)) {
    if (value && typeof value === 'object' && '_gap' in value) {
      return true;
    }
  }

  return false;
};

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
  updateQuery: (prev: TResult, subscriptionData: { data?: unknown }) => TResult;
}

export interface UsePageDataResult<TData> {
  data: TData | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
}

/**
 * Generic hook for managing page data with support for multiple subscriptions.
 *
 * IMPORTANT: The subscriptions array must remain constant between renders.
 * Do not create a new array on each render - pass a memoized or static reference.
 *
 * @param graphqlQuery - The initial GraphQL query to fetch all page data
 * @param variables - Variables for the initial query
 * @param dataParser - Optional function to transform query data into page data
 * @param subscriptions - Optional array of subscription configurations for real-time updates (must be stable)
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
  subscriptions?: SubscriptionConfig<unknown, TResult, TSubVars>[]
): UsePageDataResult<TData> {
  const [data, setData] = useState<TData | undefined>(undefined);
  const subscriptionCountRef = useRef<number | undefined>(subscriptions?.length);

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
    fetchPolicy: 'network-only'
  });

  // Initialize data when query data arrives
  useEffect(() => {
    let parsedData: TData;
    if (dataParser && queryData) {
      parsedData = dataParser(queryData);
    } else {
      parsedData = queryData as unknown as TData;
    }

    setData(parsedData);
  }, [dataParser, queryData]);

  // Set up subscriptions using subscribeToMore
  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0 || !data) {
      return;
    }

    const unsubscribers: Array<() => void> = [];

    subscriptions.forEach(config => {
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

          const hasGapMarker = isGapMarker(subscriptionData.data);
          if (hasGapMarker) {
            console.warn('[usePageData] Recovery gap detected - triggering refetch');
            refetchData().catch(err =>
              console.error('[usePageData] Failed to refetch after gap detection:', err)
            );
            return prev;
          }

          // Call the user's updateQuery function and ensure we return the result
          const updated = config.updateQuery(prev, subscriptionData as { data?: unknown });
          return updated || prev;
        }
      } as Parameters<typeof subscribeToMore>[0]);

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscriptions, subscribeToMore, data, refetchData]);

  return {
    data,
    loading: queryLoading && data === undefined,
    error: queryError,
    refetch: refetchData
  };
}
