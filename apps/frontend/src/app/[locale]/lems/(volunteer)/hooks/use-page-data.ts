import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { OperationVariables, TypedDocumentNode } from '@apollo/client';
import { useConnectionState } from '../../../../../lib/graphql/apollo-client-provider';

/**
 * Maximum time (in milliseconds) the client can recover from events.
 * If disconnected for longer than this, a full refetch is required.
 */
const RECOVERY_WINDOW_MS = 30_000; // 30 seconds

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
 * Extracts the version number from subscription data.
 * Searches for a 'version' field in any top-level object property.
 *
 * @param data - The subscription data object
 * @returns The version number, or undefined if not found
 */
const extractVersionFromData = (data: unknown): number | undefined => {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  // Search for version field in top-level object values
  for (const value of Object.values(data)) {
    if (value && typeof value === 'object' && 'version' in value) {
      const version = (value as Record<string, unknown>).version;
      if (typeof version === 'number') {
        return version;
      }
    }
  }

  return undefined;
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
  const eventVersionsRef = useRef<Map<number, number>>(new Map());

  const { state: connectionState } = useConnectionState();
  const disconnectionTimeRef = useRef<number | null>(null);

  if (subscriptions?.length !== subscriptionCountRef.current) {
    throw new Error(
      `[usePageData] Subscription count changed from ${subscriptionCountRef.current} to ${subscriptions?.length}. ` +
        'The subscriptions array must remain stable between renders. Use useMemo() to memoize the array.'
    );
  }

  // Initialize versions from sessionStorage on mount
  useEffect(() => {
    subscriptions?.forEach((config, index) => {
      const stored = sessionStorage.getItem(`page-data-version:${index}`);
      if (stored) {
        try {
          const version = parseInt(stored, 10);
          eventVersionsRef.current.set(index, version);
        } catch (error) {
          console.warn(
            `[usePageData] Failed to parse stored version for subscription ${index}:`,
            error
          );
          sessionStorage.removeItem(`page-data-version:${index}`);
        }
      }
    });
  }, [subscriptions]);

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

  // Trigger refetch if disconnected for too long
  useEffect(() => {
    if (connectionState === 'connected' && disconnectionTimeRef.current !== null) {
      const disconnectionDuration = Date.now() - disconnectionTimeRef.current;

      if (disconnectionDuration > RECOVERY_WINDOW_MS) {
        console.warn(
          `[usePageData] Connection restored after ${disconnectionDuration}ms (> ${RECOVERY_WINDOW_MS}ms recovery window) - triggering refetch`
        );

        // Clear versions to force full resubscription
        eventVersionsRef.current.clear();
        subscriptions?.forEach((_, index) => {
          sessionStorage.removeItem(`page-data-version:${index}`);
        });

        refetchData().catch(err =>
          console.error('[usePageData] Failed to refetch after reconnection:', err)
        );
      }

      disconnectionTimeRef.current = null;
    } else {
      if (disconnectionTimeRef.current === null) {
        disconnectionTimeRef.current = Date.now();
        console.log('[usePageData] Connection lost');
      }
    }
  }, [connectionState, refetchData, subscriptions]);

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
  // Only set up subscriptions once when the component mounts and queryData arrives
  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0 || !queryData) {
      return;
    }

    const unsubscribers: Array<() => void> = [];

    subscriptions.forEach((config, index) => {
      const lastSeenVersion = eventVersionsRef.current.get(index);

      console.debug(
        '[usePageData] Setting up subscription',
        index,
        'with lastSeenVersion:',
        lastSeenVersion
      );

      const subscriptionVariables = lastSeenVersion
        ? { ...config.subscriptionVariables, lastSeenVersion }
        : config.subscriptionVariables;

      const unsubscribe = subscribeToMore({
        document: config.subscription,
        variables: subscriptionVariables,
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

            // Reset version tracking on gap
            eventVersionsRef.current.delete(index);
            sessionStorage.removeItem(`page-data-version:${index}`);

            // Refetch full data to recover from gap
            refetchData().catch(err =>
              console.error('[usePageData] Failed to refetch after gap detection:', err)
            );
            return prev;
          }

          // Call the user's updateQuery function and ensure we return the result
          const updated = config.updateQuery(prev, subscriptionData as { data?: unknown });

          // Extract and persist version automatically
          const newVersion = extractVersionFromData(subscriptionData.data);
          if (newVersion !== undefined) {
            eventVersionsRef.current.set(index, newVersion);
            sessionStorage.setItem(`page-data-version:${index}`, String(newVersion));
          }

          return updated || prev;
        }
      } as Parameters<typeof subscribeToMore>[0]);

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
    // queryData is only needed to trigger this effect once when data arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions, subscribeToMore, refetchData, !!queryData]);

  return {
    data,
    loading: queryLoading && data === undefined,
    error: queryError,
    refetch: refetchData
  };
}
