import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData, Match } from '../types';

interface SubscriptionData {
  matchStarted: {
    matchId: string;
    startTime: string;
    startDelta: number;
  };
}

export const MATCH_STARTED_SUBSCRIPTION: TypedDocumentNode<SubscriptionData, SubscriptionVars> =
  gql`
    subscription MatchStarted($divisionId: String!) {
      matchStarted(divisionId: $divisionId) {
        matchId
        startTime
        startDelta
      }
    }
  `;

function updateMatches(prev: QueryData, updater: (matches: Match[]) => Match[]): QueryData {
  if (!prev.division?.field.matches) {
    return prev;
  }

  return merge(prev, {
    division: {
      id: prev.division.id,
      field: {
        matches: updater(prev.division.field.matches),
        divisionId: prev.division.field.divisionId,
        loadedMatch: prev.division.field.loadedMatch,
        activeMatch: prev.division.field.activeMatch
      }
    }
  });
}

function updateQueryWithCallback<TSubscriptionData>(
  subscription: TypedDocumentNode<TSubscriptionData, SubscriptionVars>,
  divisionId: string,
  updateQuery: (prev: QueryData, subscriptionData: { data?: unknown }) => QueryData,
  onData?: (data: TSubscriptionData) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const baseConfig: SubscriptionConfig<unknown, QueryData, SubscriptionVars> = {
    subscription,
    subscriptionVariables: { divisionId },
    updateQuery
  };

  if (onData) {
    const originalUpdateQuery = baseConfig.updateQuery;
    baseConfig.updateQuery = (prev: QueryData, subscriptionData: { data?: unknown }) => {
      if (subscriptionData.data) {
        onData(subscriptionData.data as TSubscriptionData);
      }
      return originalUpdateQuery(prev, subscriptionData);
    };
  }

  return baseConfig;
}

export function createMatchStartedSubscription(
  divisionId: string,
  onMatchStarted?: (event: SubscriptionData['matchStarted']) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const updateQuery = (prev: QueryData, { data }: { data?: unknown }) => {
    if (!data) return prev;

    const { matchId, startTime, startDelta } = (data as SubscriptionData).matchStarted;

    return updateMatches(prev, matches =>
      updateInArray(
        matches,
        match => match.id === matchId,
        match =>
          merge(match, {
            status: 'in-progress',
            startTime,
            startDelta
          })
      )
    );
  };

  return updateQueryWithCallback(
    MATCH_STARTED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onMatchStarted ? data => onMatchStarted(data.matchStarted) : undefined
  );
}
