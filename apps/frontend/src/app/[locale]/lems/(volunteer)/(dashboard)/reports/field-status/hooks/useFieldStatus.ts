'use client';

import { useQuery, useSubscription } from '@apollo/client/react';
import { useMemo } from 'react';
import {
  FIELD_STATUS_QUERY,
  MATCH_LOADED_SUBSCRIPTION,
  MATCH_STARTED_SUBSCRIPTION,
  MATCH_COMPLETED_SUBSCRIPTION,
  MATCH_ABORTED_SUBSCRIPTION,
  PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION,
  JUDGING_STARTED_SUBSCRIPTION,
  JUDGING_COMPLETED_SUBSCRIPTION,
  JUDGING_ABORTED_SUBSCRIPTION
} from '../graphql';

export interface UseFieldStatusOptions {
  divisionId: string;
  pollInterval?: number;
}

/**
 * Main hook for field status data
 * Manages GraphQL queries and subscriptions for real-time updates
 */
export function useFieldStatus({ divisionId, pollInterval = 30000 }: UseFieldStatusOptions) {
  // Main data query
  const { data, loading, error, refetch } = useQuery(FIELD_STATUS_QUERY, {
    variables: { divisionId },
    pollInterval,
    fetchPolicy: 'cache-and-network'
  });

  // Subscribe to match events
  useSubscription(MATCH_LOADED_SUBSCRIPTION, {
    variables: { divisionId },
    onData: () => refetch()
  });

  useSubscription(MATCH_STARTED_SUBSCRIPTION, {
    variables: { divisionId },
    onData: () => refetch()
  });

  useSubscription(MATCH_COMPLETED_SUBSCRIPTION, {
    variables: { divisionId },
    onData: () => refetch()
  });

  useSubscription(MATCH_ABORTED_SUBSCRIPTION, {
    variables: { divisionId },
    onData: () => refetch()
  });

  useSubscription(PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION, {
    variables: { divisionId },
    onData: () => refetch()
  });

  // Subscribe to judging events
  useSubscription(JUDGING_STARTED_SUBSCRIPTION, {
    variables: { divisionId },
    onData: () => refetch()
  });

  useSubscription(JUDGING_COMPLETED_SUBSCRIPTION, {
    variables: { divisionId },
    onData: () => refetch()
  });

  useSubscription(JUDGING_ABORTED_SUBSCRIPTION, {
    variables: { divisionId },
    onData: () => refetch()
  });

  // Computed values
  const division = data?.division;
  const field = division?.field;
  const judging = division?.judging;
  const matches = field?.matches || [];
  const sessions = judging?.sessions || [];

  const activeMatch = useMemo(() => {
    if (!field?.activeMatch) return null;
    return matches.find(m => m.id === field.activeMatch) || null;
  }, [matches, field?.activeMatch]);

  const loadedMatch = useMemo(() => {
    if (!field?.loadedMatch) return null;
    return matches.find(m => m.id === field.loadedMatch) || null;
  }, [matches, field?.loadedMatch]);

  const queuedMatches = useMemo(() => {
    return matches.filter(m => m.called && m.status === 'not-started');
  }, [matches]);

  const upcomingMatches = useMemo(() => {
    const now = new Date();
    return matches
      .filter(m => m.status === 'not-started' && new Date(m.scheduledTime) > now)
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
      .slice(0, 10);
  }, [matches]);

  const activeSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'in-progress');
  }, [sessions]);

  const queuedSessions = useMemo(() => {
    return sessions.filter(s => s.called && s.status === 'not-started');
  }, [sessions]);

  return {
    // Data
    division,
    field,
    judging,
    matches,
    sessions,
    tables: division?.tables || [],

    // Computed
    activeMatch,
    loadedMatch,
    queuedMatches,
    upcomingMatches,
    activeSessions,
    queuedSessions,

    // Status
    loading,
    error,
    refetch
  };
}
